import { test, expect } from '@playwright/test';

for (const width of [1440, 640, 390, 320]) {
  for (const language of ['zh', 'en']) {
    test(`${language} layout and content at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
      await page.goto('/');
      if (language === 'en') await page.getByRole('button', { name: 'EN', exact: true }).click();
      await expect(page.locator('html')).toHaveAttribute('lang', language === 'zh' ? 'zh-CN' : 'en');
      await expect(page.locator('h1')).toHaveText(language === 'zh' ? '张晰元' : 'Shine Yuan.');
      await page.waitForTimeout(650);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect(page.locator('#about a[href="#contact"]')).toHaveCount(0);
      await page.screenshot({ path: `output/qa/${language}-${width}-top.png` });
      for (const id of ['research', 'community', 'making', 'beyond', 'contact']) {
        await page.locator(`#${id}`).scrollIntoViewIfNeeded();
        await page.waitForTimeout(600);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${id} horizontal overflow`).toBe(true);
        await expect(page.locator(`#${id} h2`)).toBeVisible();
        if (width === 1440 || width === 390) await page.screenshot({ path: `output/qa/${language}-${width}-${id}.png` });
      }
      const paper = page.locator('.research-entry').filter({ hasText: 'MICCAI 2026' });
      await expect(paper.locator('.status')).toHaveText(language === 'zh' ? '已发表' : 'Published');
      await expect(page.locator('.partner-list a')).toHaveCount(0);
      await expect(page.locator('#community a')).toHaveCount(2);
      await expect(page.locator('.paper-list .research-entry')).toHaveCount(3);
      await expect(page.locator('.earlier-narrative')).toContainText('DFT');
      await expect(page.locator('.photo-grid img')).toHaveCount(0);
      await page.getByRole('button', { name: language === 'zh' ? '查看摄影作品' : 'View photographs', exact: true }).click();
      await expect(page.locator('.photo-grid img')).toHaveCount(9);
      for (const image of await page.locator('.photo-grid img').all()) await image.scrollIntoViewIfNeeded();
      for (const image of await page.locator('img').all()) {
        await expect(image).toHaveCSS('filter', 'none');
        expect(await image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
      }
      await expect(page.locator('body')).not.toContainText('播放与关注数据沿用');
      expect(errors).toEqual([]);
    });
  }
}

test('language persistence, tabs and keyboard, copy and navigation', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByRole('tab', { name: 'Videos & tutorials' }).click();
  await expect(page.locator('#tab-videos')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#panel-videos')).not.toHaveAttribute('inert');
  await expect(page.locator('#panel-products')).toHaveAttribute('inert');
  await page.getByRole('button', { name: '中文', exact: true }).click();
  await expect(page.locator('#tab-videos')).toHaveAttribute('aria-selected', 'true');
  await page.locator('#tab-videos').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#tab-products')).toBeFocused();
  await expect(page.locator('#tab-products')).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('button', { name: '复制邮箱', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: '复制 QQ 号码', exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('3438036864');
  await page.setViewportSize({ width: 320, height: 800 });
  await page.getByRole('button', { name: '打开导航' }).click();
  await page.getByRole('navigation').getByRole('link', { name: '研究', exact: true }).click();
  await expect(page).toHaveURL(/#research$/);
  await expect(page.getByRole('button', { name: '打开导航' })).toHaveAttribute('aria-expanded', 'false');
});

test('reduced motion uses static counters and readable content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto');
  await expect(page.locator('[data-slot="counting-number"]')).toHaveCount(0);
  await page.locator('#community').scrollIntoViewIfNeeded();
  await expect(page.locator('.community-stats')).toContainText('600+');
  await expect(page.locator('.section-reveal').first()).toHaveCSS('opacity', '1');
});

test('Chinese static content and both panels work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 800 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:8765/');
  await expect(page.locator('h1')).toHaveText('张晰元');
  await expect(page.locator('.section-reveal').first()).toHaveCSS('opacity', '1');
  await expect(page.locator('#panel-videos')).not.toHaveAttribute('inert');
  await expect(page.locator('#panel-videos a').first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});

for (const width of [1440, 320]) {
  test(`Animate UI detail interactions at ${width}px`, async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('.profile-buttons')).toHaveCount(0);
    await expect(page.locator('.about-content a')).toHaveCount(3);
    for (const venue of ['ICLR 2027', 'KDD']) {
      const entry = page.locator('.research-entry').filter({ hasText: venue });
      await expect(entry).toHaveCount(0);
    }
    const paper = page.locator('.paper-list .research-entry').filter({ hasText: 'MICCAI 2026' });
    await paper.getByRole('button').first().click();
    await expect(paper.locator('[data-slot="accordion-content"]')).toBeVisible();
    await expect(paper.locator('.paper-details')).toContainText('视觉基础模型');
    await expect(paper.getByRole('button', { name: '复制论文标题' })).toHaveCount(0);
    const gallery = page.getByRole('button', { name: '查看摄影作品', exact: true });
    await expect(page.locator('.photo-grid img')).toHaveCount(0);
    await gallery.click();
    await expect(page.locator('.photo-grid img')).toHaveCount(9);
    await page.locator('.photo-open').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('.dialog-photo')).toHaveCSS('filter', 'none');
    await page.waitForTimeout(650);
    await page.screenshot({ path: `output/qa/photo-dialog-${width}.png` });
    await page.getByRole('button', { name: '关闭详情' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('.photo-open').first()).toBeFocused();
    await page.getByRole('button', { name: '收起摄影作品', exact: true }).click();
    await expect(page.locator('.photo-grid img')).toHaveCount(0);
    await expect(gallery).toBeFocused();
    for (const flip of await page.locator('[data-slot="flip-button"]').all()) {
      const front = await flip.locator('[data-slot="flip-button-front"]').evaluate(el => ({w: (el as HTMLElement).offsetWidth, h: (el as HTMLElement).offsetHeight}));
      const back = await flip.locator('[data-slot="flip-button-back"]').evaluate(el => ({w: (el as HTMLElement).offsetWidth, h: (el as HTMLElement).offsetHeight}));
      expect(front).toEqual(back);
    }
    await page.locator('.channel-link').first().hover();
    await expect(page.locator('[data-slot="hover-card-content"]')).toHaveCount(0);
    const communityLink = page.locator('#community [data-slot="flip-button"]').first();
    await communityLink.hover();
    await expect(communityLink.locator('[data-slot="flip-button-back"]')).toHaveCSS('opacity', '1');
    await expect(page.locator('#community a').nth(1)).toHaveAttribute('href', 'https://uestc-ia.github.io/community.html');
  });
}
