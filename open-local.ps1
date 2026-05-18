param(
  [int]$StartPort = 8765,
  [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootPath = [System.IO.Path]::GetFullPath($ScriptDir).TrimEnd('\') + '\'

function Test-PortAvailable {
  param([int]$Port)

  $probe = $null
  try {
    $probe = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
    $probe.Start()
    return $true
  } catch {
    return $false
  } finally {
    if ($null -ne $probe) {
      $probe.Stop()
    }
  }
}

function Get-MimeType {
  param([string]$Path)

  switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
    ".html" { "text/html; charset=utf-8"; break }
    ".css" { "text/css; charset=utf-8"; break }
    ".js" { "text/javascript; charset=utf-8"; break }
    ".json" { "application/json; charset=utf-8"; break }
    ".png" { "image/png"; break }
    ".jpg" { "image/jpeg"; break }
    ".jpeg" { "image/jpeg"; break }
    ".gif" { "image/gif"; break }
    ".webp" { "image/webp"; break }
    ".svg" { "image/svg+xml"; break }
    ".ico" { "image/x-icon"; break }
    ".glb" { "model/gltf-binary"; break }
    default { "application/octet-stream"; break }
  }
}

function Write-Response {
  param(
    [System.IO.Stream]$Stream,
    [int]$StatusCode,
    [string]$StatusText,
    [byte[]]$Body,
    [string]$ContentType = "text/plain; charset=utf-8",
    [bool]$IncludeBody = $true
  )

  $headers = @(
    "HTTP/1.1 $StatusCode $StatusText",
    "Content-Type: $ContentType",
    "Content-Length: $($Body.Length)",
    "Cache-Control: no-store",
    "Connection: close",
    "",
    ""
  ) -join "`r`n"

  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  if ($IncludeBody -and $Body.Length -gt 0) {
    $Stream.Write($Body, 0, $Body.Length)
  }
}

function Resolve-RequestPath {
  param([string]$RequestTarget)

  $pathOnly = ($RequestTarget -split "\?", 2)[0]
  if ([string]::IsNullOrWhiteSpace($pathOnly) -or $pathOnly -eq "/") {
    $pathOnly = "/index.html"
  }

  $decoded = [System.Uri]::UnescapeDataString($pathOnly)
  $relative = $decoded.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar)
  $fullPath = [System.IO.Path]::GetFullPath((Join-Path $RootPath $relative))

  if (-not $fullPath.StartsWith($RootPath, [System.StringComparison]::OrdinalIgnoreCase)) {
    return $null
  }

  if ([System.IO.Directory]::Exists($fullPath)) {
    $fullPath = Join-Path $fullPath "index.html"
  }

  return $fullPath
}

$Port = $StartPort
while (-not (Test-PortAvailable -Port $Port)) {
  $Port += 1
}

$Listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$Listener.Start()
$Url = "http://127.0.0.1:$Port/index.html"

Write-Host "Starting local preview server..."
Write-Host "Directory: $ScriptDir"
Write-Host "URL: $Url"
Write-Host ""
Write-Host "Keep this window open while previewing."
Write-Host "Press Ctrl+C or close this window when you are done."
Write-Host ""

if (-not $NoBrowser) {
  Start-Process $Url
}

try {
  while ($true) {
    $Client = $Listener.AcceptTcpClient()
    try {
      $Stream = $Client.GetStream()
      $Reader = [System.IO.StreamReader]::new($Stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
      $RequestLine = $Reader.ReadLine()

      while ($true) {
        $Line = $Reader.ReadLine()
        if ($null -eq $Line -or $Line.Length -eq 0) {
          break
        }
      }

      if ([string]::IsNullOrWhiteSpace($RequestLine)) {
        continue
      }

      $Parts = $RequestLine.Split(" ")
      $Method = $Parts[0]
      $Target = if ($Parts.Length -gt 1) { $Parts[1] } else { "/" }
      $IncludeBody = $Method -ne "HEAD"

      if ($Method -ne "GET" -and $Method -ne "HEAD") {
        $Body = [System.Text.Encoding]::UTF8.GetBytes("Method not allowed")
        Write-Response -Stream $Stream -StatusCode 405 -StatusText "Method Not Allowed" -Body $Body -IncludeBody $IncludeBody
        continue
      }

      $FilePath = Resolve-RequestPath -RequestTarget $Target
      if ($null -eq $FilePath) {
        $Body = [System.Text.Encoding]::UTF8.GetBytes("Forbidden")
        Write-Response -Stream $Stream -StatusCode 403 -StatusText "Forbidden" -Body $Body -IncludeBody $IncludeBody
        continue
      }

      if (-not [System.IO.File]::Exists($FilePath)) {
        $Body = [System.Text.Encoding]::UTF8.GetBytes("Not found")
        Write-Response -Stream $Stream -StatusCode 404 -StatusText "Not Found" -Body $Body -IncludeBody $IncludeBody
        continue
      }

      $Body = [System.IO.File]::ReadAllBytes($FilePath)
      $ContentType = Get-MimeType -Path $FilePath
      Write-Response -Stream $Stream -StatusCode 200 -StatusText "OK" -Body $Body -ContentType $ContentType -IncludeBody $IncludeBody
    } catch {
      try {
        $Body = [System.Text.Encoding]::UTF8.GetBytes("Server error")
        Write-Response -Stream $Stream -StatusCode 500 -StatusText "Internal Server Error" -Body $Body
      } catch {
      }
    } finally {
      $Client.Close()
    }
  }
} finally {
  $Listener.Stop()
}
