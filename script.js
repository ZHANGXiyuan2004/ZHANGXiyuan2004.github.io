(() => {
  const root = document.documentElement;
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const prefersReducedMotion = () => reducedMotionQuery.matches;

  let startLocationRotation = () => {};
  let stopLocationRotation = () => {};
  let startCarouselAnimation = () => {};
  let stopCarouselAnimation = () => {};
  let startContactRingAnimation = () => {};
  let stopContactRingAnimation = () => {};
  let cancelSmoothScroll = () => {};

  const parseCssTime = (value, fallback) => {
    const time = value.trim();
    if (!time) return fallback;

    const amount = Number.parseFloat(time);
    if (!Number.isFinite(amount)) return fallback;

    return time.endsWith("ms") ? amount : amount * 1000;
  };

  const onDomReady = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  };

  const wait = (duration) => new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });

  const decodeImage = (image) => {
    if (image.complete && image.naturalWidth > 0) return Promise.resolve();

    if (typeof image.decode === "function") {
      return image.decode().catch(() => {});
    }

    return new Promise((resolve) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
    });
  };

  const waitForImages = (images, timeout = 900) => Promise.race([
    Promise.allSettled(images.map(decodeImage)),
    wait(timeout),
  ]);

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const lerp = (start, end, amount) => start + (end - start) * amount;
  const easeOutCubic = (value) => 1 - Math.pow(1 - clamp(value, 0, 1), 3);

  const getTarget = (selector) => {
    if (!selector || selector === "#") return null;

    try {
      return document.querySelector(selector);
    } catch {
      return null;
    }
  };

  const setPointerVarsFromPoint = (element, point, rect) => {
    const x = point.clientX - rect.left;
    const y = point.clientY - rect.top;
    element.style.setProperty("--hover-x", `${x}px`);
    element.style.setProperty("--hover-y", `${y}px`);
    return { x, y };
  };

  const setPointerVars = (element, event) => {
    const rect = element.getBoundingClientRect();
    return {
      rect,
      ...setPointerVarsFromPoint(element, event, rect),
    };
  };

  const createRafPointerEffect = (element, onFrame, options = {}) => {
    let latestPoint = null;
    let frame = 0;
    let rect = null;

    const readRect = () => {
      rect = element.getBoundingClientRect();
    };

    const clearFrame = () => {
      if (!frame) return;
      window.cancelAnimationFrame(frame);
      frame = 0;
    };

    const run = () => {
      frame = 0;
      if (!latestPoint) return;
      if (!rect || options.cacheRect === false) readRect();
      onFrame(latestPoint, rect);
    };

    element.addEventListener("pointerenter", () => {
      if (options.cacheRect !== false) readRect();
      options.onEnter?.();
    }, { passive: true });

    element.addEventListener("pointermove", (event) => {
      latestPoint = { clientX: event.clientX, clientY: event.clientY };
      options.onMove?.();
      if (!frame) frame = window.requestAnimationFrame(run);
    }, { passive: true });

    element.addEventListener("pointerleave", () => {
      clearFrame();
      latestPoint = null;
      rect = null;
      options.onLeave?.();
    }, { passive: true });

    if (options.invalidateOnWindow) {
      const invalidate = () => {
        rect = null;
      };
      window.addEventListener("resize", invalidate, { passive: true });
      window.addEventListener("scroll", invalidate, { passive: true });
    }
  };

  const createRipple = (element, event) => {
    if (!element.isConnected) return;
    const { x, y } = setPointerVars(element, event);
    const ripple = document.createElement("span");
    ripple.className = "btn-ripple";
    ripple.style.setProperty("--ripple-x", `${x}px`);
    ripple.style.setProperty("--ripple-y", `${y}px`);
    element.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
  };

  let latestPointerPosition = null;
  let globalPointerStarted = false;
  const pointerFrameSubscribers = new Set();

  const initGlobalPointer = () => {
    const cursorLight = document.querySelector(".cursor-light");
    const deskScene = document.querySelector(".desk-scene");
    if (globalPointerStarted || (!cursorLight && !deskScene)) return;

    globalPointerStarted = true;
    let frame = 0;

    window.addEventListener("pointermove", (event) => {
      latestPointerPosition = { x: event.clientX, y: event.clientY };

      if (!frame) {
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          if (!latestPointerPosition) return;

          if (cursorLight) {
            root.style.setProperty("--cursor-x", `${latestPointerPosition.x}px`);
            root.style.setProperty("--cursor-y", `${latestPointerPosition.y}px`);
          }

          pointerFrameSubscribers.forEach((callback) => callback(latestPointerPosition));
        });
      }
    }, { passive: true });

    window.addEventListener("pointerleave", () => {
      if (cursorLight) {
        root.style.setProperty("--cursor-x", "50%");
        root.style.setProperty("--cursor-y", "30%");
      }
    });
  };

  const initDeskScene = () => {
    const deskScene = document.querySelector(".desk-scene");
    if (!deskScene) return;

    const deskHoverItems = document.querySelectorAll(
      ".pencil, .digital-clock, .notebook, .homepod-set, .laptop, .mouse"
    );
    const deskFloatTimers = new WeakMap();
    const deskResetUnlockTimers = new WeakMap();
    const deskResetFrames = new WeakMap();
    const deskResetLockedItems = new Set();
    let deskHoverFloatDelay = 760;
    let deskHoverResetDuration = 720;

    const refreshDeskTimings = () => {
      const rootStyles = getComputedStyle(root);
      deskHoverFloatDelay = parseCssTime(
        rootStyles.getPropertyValue("--desk-hover-float-delay"),
        760
      );
      deskHoverResetDuration = parseCssTime(
        rootStyles.getPropertyValue("--desk-hover-reset-duration"),
        720
      );
    };

    const cancelDeskItemFloat = (item) => {
      const timer = deskFloatTimers.get(item);
      if (timer) {
        window.clearTimeout(timer);
        deskFloatTimers.delete(item);
      }

      item.classList.remove("is-desk-item-floating");
    };

    const cancelDeskItemResetFrame = (item) => {
      const frame = deskResetFrames.get(item);
      if (!frame) return;

      window.cancelAnimationFrame(frame);
      deskResetFrames.delete(item);
    };

    const clearDeskItemInlineMotion = (item) => {
      cancelDeskItemFloat(item);
      cancelDeskItemResetFrame(item);
      deskResetLockedItems.delete(item);
      const unlockTimer = deskResetUnlockTimers.get(item);
      if (unlockTimer) {
        window.clearTimeout(unlockTimer);
        deskResetUnlockTimers.delete(item);
      }

      item.classList.remove("is-desk-item-resetting", "is-desk-item-floating");
      item.style.removeProperty("animation");
      item.style.removeProperty("filter");
      item.style.removeProperty("transform");
      item.style.removeProperty("transition");
      item.style.removeProperty("translate");
      item.style.removeProperty("rotate");
    };

    const isPointerInsideDeskItem = (item) => {
      if (!latestPointerPosition) return false;

      const rect = item.getBoundingClientRect();
      return (
        latestPointerPosition.x >= rect.left &&
        latestPointerPosition.x <= rect.right &&
        latestPointerPosition.y >= rect.top &&
        latestPointerPosition.y <= rect.bottom
      );
    };

    const unlockDeskItemIfPointerOutside = (item) => {
      if (!deskResetLockedItems.has(item)) return;
      if (isPointerInsideDeskItem(item)) return;

      deskResetLockedItems.delete(item);
      const unlockTimer = deskResetUnlockTimers.get(item);
      if (unlockTimer) {
        window.clearTimeout(unlockTimer);
        deskResetUnlockTimers.delete(item);
      }
      item.classList.remove("is-desk-item-resetting");
    };

    const unlockDeskItemsOutsidePointer = () => {
      if (deskResetLockedItems.size === 0) return;
      deskResetLockedItems.forEach(unlockDeskItemIfPointerOutside);
    };

    const scheduleDeskItemFloat = (item) => {
      cancelDeskItemFloat(item);

      const timer = window.setTimeout(() => {
        deskFloatTimers.delete(item);
        if (!item.classList.contains("is-desk-item-hovered")) return;
        if (item.classList.contains("is-desk-item-resetting")) return;

        item.classList.add("is-desk-item-floating");
      }, deskHoverFloatDelay);

      deskFloatTimers.set(item, timer);
    };

    const resetDeskItem = (item) => {
      const computed = getComputedStyle(item);
      const currentTranslate = computed.translate && computed.translate !== "none"
        ? computed.translate
        : "0 0";
      const currentRotate = computed.rotate && computed.rotate !== "none"
        ? computed.rotate
        : "0deg";

      deskResetLockedItems.delete(item);
      cancelDeskItemResetFrame(item);
      item.style.translate = currentTranslate;
      item.style.rotate = currentRotate;
      cancelDeskItemFloat(item);
      item.classList.remove("is-desk-item-hovered", "is-desk-item-floating");
      item.classList.add("is-desk-item-resetting");

      item.style.removeProperty("animation");
      item.style.removeProperty("filter");
      item.style.removeProperty("transform");
      item.style.removeProperty("transition");

      const resetFrame = window.requestAnimationFrame(() => {
        item.style.removeProperty("translate");
        item.style.removeProperty("rotate");
        deskResetFrames.delete(item);
      });
      deskResetFrames.set(item, resetFrame);

      const unlockTimer = window.setTimeout(() => {
        deskResetUnlockTimers.delete(item);
        deskResetLockedItems.add(item);
        unlockDeskItemIfPointerOutside(item);
      }, deskHoverResetDuration + 80);
      deskResetUnlockTimers.set(item, unlockTimer);
    };

    const startDeskEntrance = (() => {
      let started = false;
      return () => {
        if (started) return;
        started = true;

        const entranceCompleteAt = prefersReducedMotion()
          ? 0
          : parseCssTime(
            getComputedStyle(deskScene).getPropertyValue("--desk-entrance-complete"),
            2750
          );

        root.classList.remove("page-entrance-started", "page-entrance-complete");
        deskScene.classList.remove("entrance-complete");
        root.classList.add("page-entrance-started");
        deskScene.classList.add("animate-in");
        window.setTimeout(() => {
          root.classList.add("page-entrance-complete");
          deskScene.classList.add("entrance-complete");
          deskScene.classList.remove("animate-in");
          window.dispatchEvent(new Event("page-entrance-complete"));
        }, entranceCompleteAt);
      };
    })();

    refreshDeskTimings();

    createRafPointerEffect(
      deskScene,
      (point, rect) => {
        deskScene.style.setProperty("--desk-x", `${point.clientX - rect.left}px`);
        deskScene.style.setProperty("--desk-y", `${point.clientY - rect.top}px`);
        deskScene.classList.add("is-desk-hot");
      },
      {
        invalidateOnWindow: true,
        onLeave: () => deskScene.classList.remove("is-desk-hot"),
      }
    );

    deskHoverItems.forEach((item) => {
      item.addEventListener("pointerenter", () => {
        if (!deskScene.classList.contains("entrance-complete")) return;
        if (item.classList.contains("is-desk-item-resetting")) return;

        clearDeskItemInlineMotion(item);
        item.classList.add("is-desk-item-hovered");
        scheduleDeskItemFloat(item);
      });

      item.addEventListener("pointerleave", () => {
        if (!item.classList.contains("is-desk-item-hovered")) return;
        resetDeskItem(item);
      });
    });

    pointerFrameSubscribers.add(unlockDeskItemsOutsidePointer);
    reducedMotionQuery.addEventListener("change", refreshDeskTimings);

    onDomReady(() => {
      const deskImages = [...deskScene.querySelectorAll("img")];
      waitForImages(deskImages, 900).then(startDeskEntrance);
    });

    window.addEventListener("load", startDeskEntrance, { once: true });
  };

  const initReveal = () => {
    const aboutRevealItems = document.querySelectorAll(".about-reveal");
    const revealItems = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window)) {
      [...aboutRevealItems, ...revealItems].forEach((item) => item.classList.add("visible"));
      return;
    }

    if (aboutRevealItems.length > 0) {
      const aboutRevealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              aboutRevealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.18 }
      );

      aboutRevealItems.forEach((item) => aboutRevealObserver.observe(item));
    }

    if (revealItems.length > 0) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.16 }
      );

      revealItems.forEach((item) => revealObserver.observe(item));
    }
  };

  const initTiltCards = () => {
    const projectCards = document.querySelectorAll("[data-tilt]");
    if (projectCards.length === 0) return;

    projectCards.forEach((card) => {
      createRafPointerEffect(
        card,
        (point, rect) => {
          const px = (point.clientX - rect.left) / rect.width;
          const py = (point.clientY - rect.top) / rect.height;
          const rotateY = (px - 0.5) * 5;
          const rotateX = (0.5 - py) * 5;

          card.style.setProperty("--local-x", `${px * 100}%`);
          card.style.setProperty("--local-y", `${py * 100}%`);
          card.style.setProperty("--visual-x", `${(0.5 - px) * 10}px`);
          card.style.setProperty("--visual-y", `${(0.5 - py) * 8}px`);
          card.classList.add("is-card-hovered");
          card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        },
        {
          onLeave: () => {
            card.classList.remove("is-card-hovered");
            card.style.transform = "";
            card.style.removeProperty("--visual-x");
            card.style.removeProperty("--visual-y");
          },
        }
      );
    });
  };

  const initFeatureCards = () => {
    const featureCards = document.querySelectorAll(".feature-card");
    if (featureCards.length === 0) return;

    featureCards.forEach((card) => {
      createRafPointerEffect(
        card,
        (point, rect) => {
          setPointerVarsFromPoint(card, point, rect);
          card.classList.add("is-feature-hovered");
        },
        {
          onLeave: () => card.classList.remove("is-feature-hovered"),
        }
      );
    });
  };

  const initToolStack = () => {
    const toolIcons = document.querySelectorAll(".app-stack span");
    const appStack = document.querySelector(".app-stack");
    if (!appStack || toolIcons.length === 0) return;

    const clearActiveTool = () => {
      appStack.classList.remove("is-tools-hot");
      toolIcons.forEach((icon) => icon.classList.remove("is-tool-hovered"));
    };

    const setActiveTool = (activeIcon) => {
      appStack.classList.add("is-tools-hot");
      toolIcons.forEach((icon) => {
        icon.classList.toggle("is-tool-hovered", icon === activeIcon);
      });
    };

    toolIcons.forEach((icon) => {
      icon.addEventListener("pointerenter", () => setActiveTool(icon));
      icon.addEventListener("focus", () => setActiveTool(icon));
    });

    appStack.addEventListener("pointerleave", clearActiveTool);
    appStack.addEventListener("focusout", (event) => {
      if (!appStack.contains(event.relatedTarget)) clearActiveTool();
    });
  };

  const initDock = () => {
    const dock = document.querySelector(".dock");
    const dockLinks = document.querySelectorAll(".dock a");
    if (!dock || dockLinks.length === 0) return;

    const sections = [...document.querySelectorAll("#about, #research, #product, #blog, #contact")];
    if (sections.length > 0 && "IntersectionObserver" in window) {
      const sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            dockLinks.forEach((link) => {
              link.classList.toggle("active", link.dataset.nav === entry.target.id);
            });
          });
        },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
      );

      sections.forEach((section) => sectionObserver.observe(section));
    }

    createRafPointerEffect(
      dock,
      (point, rect) => {
        setPointerVarsFromPoint(dock, point, rect);
        dock.classList.add("is-hot");
        dock.style.setProperty("--dock-x", `${point.clientX - rect.left}px`);
        dock.style.setProperty("--dock-y", `${point.clientY - rect.top}px`);
      },
      {
        onLeave: () => dock.classList.remove("is-hot"),
      }
    );

    dockLinks.forEach((link) => {
      createRafPointerEffect(
        link,
        (point, rect) => {
          const { x, y } = setPointerVarsFromPoint(link, point, rect);
          const mx = x - rect.width / 2;
          const my = y - rect.height / 2;
          link.classList.add("is-hovered");
          link.style.transform = `translate(${mx * 0.16}px, ${my * 0.16}px) scale(1.06)`;
        },
        {
          onLeave: () => {
            link.classList.remove("is-hovered");
            link.style.transform = "";
          },
        }
      );

      link.addEventListener("pointerdown", (event) => createRipple(link, event));
    });
  };

  const initInteractiveHover = () => {
    const hoverItems = document.querySelectorAll(
      ".product-btn"
    );
    if (hoverItems.length === 0) return;

    const hoverTransforms = new WeakMap();
    const pressedItems = new WeakSet();
    const applyHoverTransform = (item, transform) => {
      hoverTransforms.set(item, transform);
      item.style.transform = pressedItems.has(item) ? `${transform} scale(0.985)` : transform;
    };

    hoverItems.forEach((item) => {
      createRafPointerEffect(
        item,
        (point, rect) => {
          const { x, y } = setPointerVarsFromPoint(item, point, rect);
          const mx = x - rect.width / 2;
          const my = y - rect.height / 2;
          item.classList.add("is-hovered");
          applyHoverTransform(item, `translate(${mx * 0.12}px, ${my * 0.16}px) scale(1.025)`);
        },
        {
          onLeave: () => {
            pressedItems.delete(item);
            hoverTransforms.delete(item);
            item.classList.remove("is-hovered");
            item.style.transform = "";
          },
        }
      );

      item.addEventListener("pointerdown", (event) => {
        pressedItems.add(item);
        const transform = hoverTransforms.get(item);
        if (transform) item.style.transform = `${transform} scale(0.985)`;
        createRipple(item, event);
      });

      const release = () => {
        pressedItems.delete(item);
        const transform = hoverTransforms.get(item);
        if (transform) item.style.transform = transform;
      };

      item.addEventListener("pointerup", release);
      item.addEventListener("pointercancel", release);
    });
  };

  const initLocationRotation = () => {
    const locationNode = document.querySelector("[data-location]");
    if (!locationNode) return;

    const locations = ["Hangzhou", "Chengdu", "Shanghai"];
    let locationIndex = 0;
    let locationTimer = null;
    let locationAnimation = null;

    startLocationRotation = () => {
      if (locationTimer || prefersReducedMotion()) return;

      locationTimer = window.setInterval(() => {
        if (prefersReducedMotion()) {
          stopLocationRotation();
          return;
        }

        locationIndex = (locationIndex + 1) % locations.length;
        locationAnimation = locationNode.animate(
          [
            { opacity: 1, transform: "translateY(0)" },
            { opacity: 0, transform: "translateY(6px)" },
          ],
          { duration: 180, easing: "ease" }
        );

        locationAnimation.onfinish = () => {
          if (prefersReducedMotion()) {
            locationAnimation = null;
            return;
          }

          locationNode.textContent = locations[locationIndex];
          locationAnimation = locationNode.animate(
            [
              { opacity: 0, transform: "translateY(-6px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            { duration: 220, easing: "ease" }
          );
          locationAnimation.onfinish = () => {
            locationAnimation = null;
          };
        };
      }, 2300);
    };

    stopLocationRotation = () => {
      if (locationTimer) {
        window.clearInterval(locationTimer);
        locationTimer = null;
      }

      if (locationAnimation) {
        locationAnimation.onfinish = null;
        locationAnimation.cancel();
        locationAnimation = null;
      }
    };

    if (root.classList.contains("page-entrance-complete")) {
      startLocationRotation();
    } else {
      window.addEventListener("page-entrance-complete", startLocationRotation, { once: true });
    }
  };

  const initHashScroll = () => {
    const anchors = document.querySelectorAll('a[href^="#"]');
    const hasInitialHashTarget = Boolean(getTarget(window.location.hash));
    if (anchors.length === 0 && !hasInitialHashTarget) return;

    let scrollAnimationFrame = null;

    cancelSmoothScroll = () => {
      if (!scrollAnimationFrame) return;
      window.cancelAnimationFrame(scrollAnimationFrame);
      scrollAnimationFrame = null;
    };

    const smoothScrollTo = (targetSelector, duration = 1200) => {
      const target = getTarget(targetSelector);
      if (!target) return;

      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      let startTime = null;

      cancelSmoothScroll();

      if (prefersReducedMotion()) {
        window.scrollTo(0, targetPosition);
        return;
      }

      const ease = (time, start, change, total) => {
        let t = time / (total / 2);
        if (t < 1) return change / 2 * t * t * t * t + start;
        t -= 2;
        return -change / 2 * (t * t * t * t - 2) + start;
      };

      const animation = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) {
          scrollAnimationFrame = window.requestAnimationFrame(animation);
        } else {
          window.scrollTo(0, targetPosition);
          scrollAnimationFrame = null;
        }
      };

      scrollAnimationFrame = window.requestAnimationFrame(animation);
    };

    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    if (hasInitialHashTarget) {
      const hash = window.location.hash;
      window.scrollTo(0, 0);
      history.replaceState(null, "", window.location.pathname + window.location.search);

      window.setTimeout(() => {
        window.scrollTo(0, 0);
        smoothScrollTo(hash, 2000);
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }

    anchors.forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        const targetId = anchor.getAttribute("href");
        if (targetId === "#") {
          event.preventDefault();
          return;
        }

        if (!getTarget(targetId)) return;

        event.preventDefault();
        history.pushState(null, "", targetId);
        smoothScrollTo(targetId, 1500);
      });
    });
  };

  const initBlogSequence = () => {
    const section = document.querySelector("#blog");
    const sequence = section?.querySelector("[data-blog-sequence]");
    const gsapRuntime = window.gsap;
    const ScrollTriggerRuntime = window.ScrollTrigger;
    if (!section || !sequence || !gsapRuntime || !ScrollTriggerRuntime) return;
    if (typeof gsapRuntime.matchMedia !== "function") return;

    const pin = sequence.querySelector(".blog-sequence-pin");
    const frame = sequence.querySelector(".blog-sequence-frame");
    const shade = sequence.querySelector(".blog-sequence-shade");
    const slides = [...sequence.querySelectorAll(".blog-sequence-slide")];
    const cues = [...sequence.querySelectorAll(".blog-sequence-cue")];
    const keyhole = sequence.querySelector(".blog-keyhole");
    const corners = {
      topLeft: sequence.querySelector(".blog-keyhole-corner.top-left"),
      topRight: sequence.querySelector(".blog-keyhole-corner.top-right"),
      bottomLeft: sequence.querySelector(".blog-keyhole-corner.bottom-left"),
      bottomRight: sequence.querySelector(".blog-keyhole-corner.bottom-right"),
    };
    const progressFill = sequence.querySelector(".blog-sequence-progress-fill");
    const markers = [...sequence.querySelectorAll(".blog-sequence-marker")];
    if (!pin || !frame || !shade || slides.length === 0 || cues.length === 0 || !keyhole) return;
    if (Object.values(corners).some((corner) => !corner)) return;
    if (!progressFill || markers.length !== slides.length) return;

    const timelineDuration = Math.max(Number.parseFloat(sequence.dataset.duration) || slides.length * 2, 1);
    const desktopQuery = "(min-width: 721px) and (prefers-reduced-motion: no-preference)";
    const defaultWindowDuration = timelineDuration / Math.max(slides.length, 1);
    const keyholeInner = 76;
    const keyholeOuter = 100 - keyholeInner;
    const collapsedKeyhole = [
      "0% 0%", "0% 100%", `${keyholeOuter}% 100%`, `${keyholeOuter}% ${keyholeOuter}%`,
      `${keyholeInner}% ${keyholeOuter}%`, `${keyholeInner}% ${keyholeInner}%`,
      `${keyholeOuter}% ${keyholeInner}%`, `${keyholeOuter}% 100%`,
      "100% 100%", "100% 0%",
    ].join(",");
    const revealedKeyhole = [
      "0% 0%", "0% 100%", "0% 100%", "0% 0%",
      "100% 0%", "100% 100%", "0% 100%", "0% 100%",
      "100% 100%", "100% 0%",
    ].join(",");

    const getCueWindow = (element, fallbackStart, fallbackEnd) => {
      const start = Number.parseFloat(element.dataset.start);
      const end = Number.parseFloat(element.dataset.end);
      return {
        start: Number.isFinite(start) ? start : fallbackStart,
        end: Number.isFinite(end) ? end : fallbackEnd,
      };
    };

    const slideWindows = slides.map((slide, index) => (
      getCueWindow(
        slide,
        index * defaultWindowDuration,
        Math.min((index + 1) * defaultWindowDuration, timelineDuration)
      )
    ));
    const cueWindows = cues.map((cue, index) => (
      getCueWindow(cue, slideWindows[index]?.start ?? 0, slideWindows[index]?.end ?? timelineDuration)
    ));

    let sequenceImagesWarmed = false;
    let sequencePrewarmObserver = null;
    let sequencePrewarmIdle = 0;
    let sequencePrewarmUsesTimeout = false;
    let sequencePrewarmIndex = 0;

    const runWhenIdle = (callback, timeout = 1200) => {
      if ("requestIdleCallback" in window) {
        sequencePrewarmUsesTimeout = false;
        return window.requestIdleCallback(callback, { timeout });
      }

      sequencePrewarmUsesTimeout = true;
      return window.setTimeout(callback, Math.min(timeout, 180));
    };

    const prewarmNextSequenceImage = () => {
      if (sequencePrewarmIndex >= slides.length) {
        sequencePrewarmIdle = 0;
        return;
      }

      const slide = slides[sequencePrewarmIndex];
      sequencePrewarmIndex += 1;
      const src = slide.dataset.src;
      if (src && slide.getAttribute("src") !== src) {
        slide.loading = "eager";
        slide.decoding = "async";
        if ("fetchPriority" in slide) slide.fetchPriority = "low";
        slide.src = src;
      }

      const scheduleNext = () => {
        sequencePrewarmIdle = runWhenIdle(prewarmNextSequenceImage, 900);
      };

      decodeImage(slide).finally(scheduleNext);
    };

    const warmSequenceImages = () => {
      if (sequenceImagesWarmed) return;
      sequenceImagesWarmed = true;
      sequencePrewarmObserver?.disconnect();
      sequencePrewarmObserver = null;

      sequencePrewarmIndex = 0;
      prewarmNextSequenceImage();
    };

    const cancelSequenceImagePrewarm = () => {
      sequencePrewarmObserver?.disconnect();
      sequencePrewarmObserver = null;
      if (!sequencePrewarmIdle) return;
      if (sequencePrewarmUsesTimeout) {
        window.clearTimeout(sequencePrewarmIdle);
      } else if ("cancelIdleCallback" in window) {
        window.cancelIdleCallback(sequencePrewarmIdle);
      }
      sequencePrewarmIdle = 0;
      sequencePrewarmIndex = 0;
    };

    const queueSequenceImagePrewarm = () => {
      if (sequenceImagesWarmed) return;

      if ("IntersectionObserver" in window) {
        if (!sequencePrewarmObserver) {
          sequencePrewarmObserver = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) warmSequenceImages();
          }, { rootMargin: "2400px 0px" });
          sequencePrewarmObserver.observe(section);
        }
        return;
      }

      if (sequencePrewarmIdle) return;
      sequencePrewarmIdle = runWhenIdle(() => {
        sequencePrewarmIdle = 0;
        warmSequenceImages();
      }, 1800);
    };

    let activeCueStateIndex = -2;
    let activeMarkerStateIndex = -2;

    const resetActiveState = () => {
      cues.forEach((cue) => {
        cue.classList.remove("is-active");
        cue.removeAttribute("aria-current");
        cue.removeAttribute("tabindex");
      });
      markers.forEach((marker) => marker.classList.remove("is-active"));
      progressFill.style.removeProperty("transform");
      activeCueStateIndex = -2;
      activeMarkerStateIndex = -2;
    };

    const setActiveState = (progress) => {
      const clampedProgress = clamp(progress, 0, 1);
      const currentTime = clampedProgress * timelineDuration;
      progressFill.style.setProperty("transform", `scaleX(${clampedProgress})`);

      const activeCueIndex = slideWindows.findIndex((slideWindow, index) => (
        currentTime >= slideWindow.start
        && (currentTime < slideWindow.end || (index === slideWindows.length - 1 && clampedProgress >= 1))
      ));

      const activeMarkerIndex = slideWindows.findIndex((slideWindow, index) => (
        currentTime >= slideWindow.start
        && (currentTime < slideWindow.end || (index === slideWindows.length - 1 && clampedProgress >= 1))
      ));

      if (activeCueIndex !== activeCueStateIndex) {
        cues.forEach((cue, index) => {
          const isActive = index === activeCueIndex;
          cue.classList.toggle("is-active", isActive);
          cue.tabIndex = isActive ? 0 : -1;
          if (isActive) {
            cue.setAttribute("aria-current", "true");
          } else {
            cue.removeAttribute("aria-current");
          }
        });
        activeCueStateIndex = activeCueIndex;
      }

      if (activeMarkerIndex !== activeMarkerStateIndex) {
        markers.forEach((marker, index) => {
          marker.classList.toggle("is-active", index === activeMarkerIndex);
        });
        activeMarkerStateIndex = activeMarkerIndex;
      }
    };

    gsapRuntime.registerPlugin(ScrollTriggerRuntime);

    const media = gsapRuntime.matchMedia();
    media.add(desktopQuery, () => {
      section.classList.add("is-blog-sequence-ready");
      queueSequenceImagePrewarm();

      const context = gsapRuntime.context(() => {
        gsapRuntime.set(shade, { autoAlpha: 0 });
        gsapRuntime.set(slides, { autoAlpha: 0, scale: 1, force3D: true });
        gsapRuntime.set(cues, { autoAlpha: 0, y: 26, force3D: true });
        gsapRuntime.set(keyhole, { clipPath: `polygon(${collapsedKeyhole})` });
        gsapRuntime.set(corners.topLeft, { top: `${keyholeOuter}%`, left: `${keyholeOuter}%` });
        gsapRuntime.set(corners.topRight, { top: `${keyholeOuter}%`, left: `${keyholeInner}%` });
        gsapRuntime.set(corners.bottomLeft, { top: `${keyholeInner}%`, left: `${keyholeOuter}%` });
        gsapRuntime.set(corners.bottomRight, { top: `${keyholeInner}%`, left: `${keyholeInner}%` });

        const timeline = gsapRuntime.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: sequence,
            pin,
            start: "top 12%",
            end: () => `+=${Math.max(window.innerHeight * 1.54, frame.offsetHeight * 1.68)}`,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onEnter: warmSequenceImages,
            onEnterBack: warmSequenceImages,
            onUpdate: (self) => setActiveState(self.progress),
            onRefresh: (self) => setActiveState(self.progress),
          },
        });

        const slideInDuration = Math.min(defaultWindowDuration * 0.3, 0.6);
        const firstSlideInDuration = Math.min(defaultWindowDuration * 0.46, 0.92);
        const slideOutDuration = Math.min(defaultWindowDuration * 0.28, 0.56);
        const slideOutLead = Math.min(defaultWindowDuration * 0.24, 0.48);
        const cueTransitionDuration = Math.min(defaultWindowDuration * 0.24, 0.48);
        const firstCueTransitionDuration = Math.min(defaultWindowDuration * 0.36, 0.72);
        const finalExitDuration = Math.min(defaultWindowDuration * 0.56, 1.12);
        const finalExitStart = Math.max(timelineDuration - finalExitDuration, 0);
        const keyholeExitDuration = Math.min(finalExitDuration * 0.55, 0.62);
        const keyholeExitStart = Math.max(timelineDuration - keyholeExitDuration, finalExitStart);

        timeline
          .to(keyhole, { clipPath: `polygon(${revealedKeyhole})`, duration: 0.9 }, 0)
          .to(shade, { autoAlpha: 1, duration: firstSlideInDuration, ease: "power2.out" }, 0)
          .to(corners.topLeft, { top: "0%", left: "0%", duration: 0.9 }, 0)
          .to(corners.topRight, { top: "0%", left: "100%", duration: 0.9 }, 0)
          .to(corners.bottomLeft, { top: "100%", left: "0%", duration: 0.9 }, 0)
          .to(corners.bottomRight, { top: "100%", left: "100%", duration: 0.9 }, 0)
          .to(pin, { autoAlpha: 0, duration: finalExitDuration, ease: "power1.inOut" }, finalExitStart)
          .to(frame, { "--blog-frame-exit-y": "-180px", duration: finalExitDuration, ease: "power2.inOut" }, finalExitStart)
          .to(keyhole, { clipPath: `polygon(${collapsedKeyhole})`, duration: keyholeExitDuration }, keyholeExitStart)
          .to(corners.topLeft, { top: `${keyholeOuter}%`, left: `${keyholeOuter}%`, duration: keyholeExitDuration }, keyholeExitStart)
          .to(corners.topRight, { top: `${keyholeOuter}%`, left: `${keyholeInner}%`, duration: keyholeExitDuration }, keyholeExitStart)
          .to(corners.bottomLeft, { top: `${keyholeInner}%`, left: `${keyholeOuter}%`, duration: keyholeExitDuration }, keyholeExitStart)
          .to(corners.bottomRight, { top: `${keyholeInner}%`, left: `${keyholeInner}%`, duration: keyholeExitDuration }, keyholeExitStart);

        slides.forEach((slide, index) => {
          const slideWindow = slideWindows[index];
          timeline.to(slide, {
            autoAlpha: 1,
            scale: 1,
            duration: index === 0 ? firstSlideInDuration : slideInDuration,
            ease: "power2.out",
          }, slideWindow.start);

          if (index < slides.length - 1) {
            timeline.to(slide, {
              autoAlpha: 0,
              scale: 1,
              duration: slideOutDuration,
              ease: "power1.inOut",
            }, Math.max(slideWindow.start, slideWindow.end - slideOutLead));
          }
        });

        cues.forEach((cue, index) => {
          const cueWindow = cueWindows[index];
          const cueInDuration = index === 0 ? firstCueTransitionDuration : cueTransitionDuration;
          timeline
            .to(cue, {
              autoAlpha: 1,
              y: 0,
              duration: cueInDuration,
              ease: "power2.out",
            }, cueWindow.start)
            .to(cue, {
              autoAlpha: 0,
              y: -24,
              duration: cueTransitionDuration,
              ease: "power1.inOut",
            }, Math.max(cueWindow.start, cueWindow.end - cueTransitionDuration));
        });

        setActiveState(0);
      }, section);

      return () => {
        context.revert();
        section.classList.remove("is-blog-sequence-ready");
        cancelSequenceImagePrewarm();
        resetActiveState();
      };
    });
  };

  const initContactRing = () => {
    const section = document.querySelector("#contact");
    const stage = section?.querySelector("[data-contact-ring]");
    const pin = section?.querySelector(".contact-ring-pin");
    const cards = section ? [...section.querySelectorAll("[data-contact-step]")] : [];
    const title = section?.querySelector("#contact-title");
    const gsapRuntime = window.gsap;
    const ScrollTriggerRuntime = window.ScrollTrigger;
    const ThreeRuntime = window.THREE;
    if (!section || !stage || !pin || cards.length === 0) return;
    if (!gsapRuntime || !ScrollTriggerRuntime || !ThreeRuntime) return;
    if (typeof gsapRuntime.matchMedia !== "function") return;

    const imagePaths = (stage.dataset.images || "")
      .split(",")
      .map((path) => path.trim())
      .filter(Boolean);
    if (imagePaths.length === 0) return;

    gsapRuntime.registerPlugin(ScrollTriggerRuntime);

    const scene = new ThreeRuntime.Scene();
    const camera = new ThreeRuntime.PerspectiveCamera(42, 1, 0.1, 140);
    let renderer = null;
    try {
      renderer = new ThreeRuntime.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      section.classList.add("is-contact-ring-static", "is-contact-ring-unavailable");
      return;
    }
    renderer.setClearColor(0x050505, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    if ("outputColorSpace" in renderer && ThreeRuntime.SRGBColorSpace) {
      renderer.outputColorSpace = ThreeRuntime.SRGBColorSpace;
    } else if ("outputEncoding" in renderer && ThreeRuntime.sRGBEncoding) {
      renderer.outputEncoding = ThreeRuntime.sRGBEncoding;
    }
    stage.appendChild(renderer.domElement);

    const rootGroup = new ThreeRuntime.Group();
    scene.add(rootGroup);

    const ringSpecs = [
      { count: 12, radius: 5.4, size: 1.26, opacity: 0.92 },
      { count: 18, radius: 8.55, size: 1.46, opacity: 0.82 },
      { count: 24, radius: 11.85, size: 1.68, opacity: 0.7 },
    ];
    const rings = [];
    const ringMaterials = [];
    const materialsByPath = new Map();
    let imageIndex = 0;

    ringSpecs.forEach((spec, ringIndex) => {
      const ring = new ThreeRuntime.Group();
      ring.userData.baseRotation = ringIndex * 0.22;
      rootGroup.add(ring);
      rings.push(ring);

      for (let index = 0; index < spec.count; index += 1) {
        const path = imagePaths[imageIndex % imagePaths.length];
        imageIndex += 1;

        const pivot = new ThreeRuntime.Group();
        const angle = (index / spec.count) * Math.PI * 2;
        pivot.rotation.z = angle;
        ring.add(pivot);

        const geometry = new ThreeRuntime.PlaneGeometry(spec.size, spec.size);
        const material = new ThreeRuntime.MeshBasicMaterial({
          color: 0x252525,
          opacity: 0,
          side: ThreeRuntime.DoubleSide,
          transparent: true,
        });
        material.userData.baseOpacity = spec.opacity;
        const mesh = new ThreeRuntime.Mesh(geometry, material);
        mesh.position.x = spec.radius;
        mesh.rotation.z = -Math.PI / 2;
        pivot.add(mesh);
        ringMaterials.push(material);

        if (!materialsByPath.has(path)) materialsByPath.set(path, []);
        materialsByPath.get(path).push(material);
      }
    });

    const textureLoader = new ThreeRuntime.TextureLoader();
    let texturesStarted = false;
    let textureObserver = null;

    const applySquareCrop = (texture) => {
      const image = texture.image || {};
      const width = image.naturalWidth || image.videoWidth || image.width || 1;
      const height = image.naturalHeight || image.videoHeight || image.height || 1;
      const aspect = width / height;

      texture.center.set(0.5, 0.5);
      if (aspect > 1) {
        texture.repeat.set(1 / aspect, 1);
      } else {
        texture.repeat.set(1, aspect);
      }
      texture.offset.set((1 - texture.repeat.x) / 2, (1 - texture.repeat.y) / 2);
      if ("colorSpace" in texture && ThreeRuntime.SRGBColorSpace) {
        texture.colorSpace = ThreeRuntime.SRGBColorSpace;
      } else if ("encoding" in texture && ThreeRuntime.sRGBEncoding) {
        texture.encoding = ThreeRuntime.sRGBEncoding;
      }
      texture.needsUpdate = true;
    };

    let currentRingProgress = 0;
    const renderContactRing = (progress = currentRingProgress) => {
      if (Number.isFinite(progress)) currentRingProgress = clamp(progress, 0, 1);
      const width = stage.clientWidth || window.innerWidth || 1;
      const isCompact = width <= 720;
      const entry = easeOutCubic(clamp(currentRingProgress / 0.34, 0, 1));
      const sequence = easeOutCubic(currentRingProgress);
      const entryOpacity = clamp((currentRingProgress - 0.015) / 0.22, 0, 1);
      const scale = lerp(isCompact ? 0.28 : 0.24, isCompact ? 0.74 : 0.98, entry);

      rootGroup.scale.setScalar(scale);
      rootGroup.rotation.z = lerp(-0.58, 0.36, sequence);
      rings.forEach((ring, index) => {
        const direction = index % 2 === 0 ? 1 : -1;
        const turn = currentRingProgress * Math.PI * (isCompact ? 2.45 : 3.25) * (1 + index * 0.24);
        const ringScale = lerp(0.56 + index * 0.05, 1, entry);
        ring.rotation.z = ring.userData.baseRotation + direction * turn;
        ring.position.z = lerp(18 + index * 4.6, -index * 0.8, entry);
        ring.scale.setScalar(ringScale);
        ring.visible = !isCompact || index < 2;
      });

      ringMaterials.forEach((material) => {
        material.opacity = (material.userData.baseOpacity || 1) * entryOpacity;
        material.needsUpdate = true;
      });

      renderer.render(scene, camera);
    };

    const resizeRenderer = () => {
      const width = Math.max(stage.clientWidth || window.innerWidth || 1, 1);
      const height = Math.max(stage.clientHeight || window.innerHeight || 1, 1);
      const isCompact = width <= 720;

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = isCompact ? 48 : 42;
      camera.position.set(0, 0, isCompact ? 17.5 : 18.5);
      camera.updateProjectionMatrix();
      renderContactRing();
    };

    const loadTexturesOnce = () => {
      if (texturesStarted) return;
      texturesStarted = true;
      textureObserver?.disconnect();

      imagePaths.forEach((path) => {
        textureLoader.load(
          path,
          (texture) => {
            applySquareCrop(texture);
            const materials = materialsByPath.get(path) || [];
            materials.forEach((material) => {
              material.map = texture;
              material.color.set(0xffffff);
              material.needsUpdate = true;
            });
            renderContactRing();
          },
          undefined,
          () => {}
        );
      });
    };

    const queueTextureLoading = () => {
      if (texturesStarted) return;
      if ("IntersectionObserver" in window) {
        textureObserver = new IntersectionObserver((entries) => {
          if (entries.some((entry) => entry.isIntersecting)) loadTexturesOnce();
        }, { rootMargin: "600px 0px" });
        textureObserver.observe(section);
        return;
      }

      const idle = window.requestIdleCallback || ((callback) => window.setTimeout(callback, 1200));
      idle(loadTexturesOnce);
    };

    const originalTabIndex = new Map();
    cards.forEach((card) => {
      originalTabIndex.set(card, card.getAttribute("tabindex"));
    });

    const setCardFocusable = (card, isFocusable) => {
      if (!card.matches("a, button, input, select, textarea, [tabindex]")) return;
      if (isFocusable) {
        const value = originalTabIndex.get(card);
        if (value === null) {
          card.removeAttribute("tabindex");
        } else {
          card.setAttribute("tabindex", value);
        }
        return;
      }

      card.setAttribute("tabindex", "-1");
    };

    const restoreCards = () => {
      cards.forEach((card) => {
        card.classList.remove("is-active");
        card.removeAttribute("aria-hidden");
        setCardFocusable(card, true);
      });
    };

    const setActiveCard = (progress, hasVisibleCard = true) => {
      const activeIndex = clamp(Math.floor(progress * cards.length), 0, cards.length - 1);
      cards.forEach((card, index) => {
        const isActive = hasVisibleCard && index === activeIndex;
        card.classList.toggle("is-active", isActive);
        card.setAttribute("aria-hidden", isActive ? "false" : "true");
        setCardFocusable(card, isActive);
      });
    };

    const easeInOutSine = (value) => {
      const amount = clamp(value, 0, 1);
      return 0.5 - Math.cos(amount * Math.PI) / 2;
    };

    const resetLandingOffset = () => {
      section.style.setProperty("--contact-landing-y", "0px");
    };

    const updateLandingOffset = () => {
      const viewportHeight = window.innerHeight || 1;
      const viewportWidth = stage.clientWidth || window.innerWidth || 1;
      const entryDistance = Math.max(viewportHeight * 1.08, 1);
      const sectionTop = section.getBoundingClientRect().top;
      const rawProgress = clamp((entryDistance - sectionTop) / entryDistance, 0, 1);
      const settleProgress = easeOutCubic(clamp((rawProgress - 0.02) / 0.98, 0, 1));
      const lift = Math.min(viewportHeight * 0.14, viewportWidth <= 720 ? 72 : 118);
      const offset = -lift * (1 - settleProgress);
      section.style.setProperty("--contact-landing-y", `${offset.toFixed(2)}px`);
    };

    const softenContactProgress = (progress) => {
      const amount = clamp(progress, 0, 1);
      const landingBand = 0.28;
      if (amount >= landingBand) return amount;
      const easedLanding = landingBand * easeInOutSine(clamp(amount / landingBand, 0, 1));
      return lerp(amount, easedLanding, 0.52);
    };

    let context = null;

    const showStaticContactRing = () => {
      section.classList.remove("is-contact-ring-ready");
      section.classList.add("is-contact-ring-static");
      resetLandingOffset();
      restoreCards();
      renderContactRing(0.72);
    };

    const stopPinnedContactRing = () => {
      if (context) {
        context.revert();
        context = null;
      }
      section.classList.remove("is-contact-ring-ready");
      resetLandingOffset();
      restoreCards();
      renderContactRing(0.72);
      ScrollTriggerRuntime.refresh();
    };

    const startPinnedContactRing = () => {
      if (context) return;
      if (prefersReducedMotion()) {
        stopPinnedContactRing();
        showStaticContactRing();
        return;
      }

      section.classList.remove("is-contact-ring-static");
      section.classList.add("is-contact-ring-ready");

      context = gsapRuntime.context(() => {
        const introDuration = 0.78;
        const firstCardStart = 0.24;
        const totalTimelineDuration = introDuration + cards.length;
        const syncActiveCard = (progress) => {
          const time = clamp(progress, 0, 1) * totalTimelineDuration;
          const cardProgress = clamp((time - introDuration) / cards.length, 0, 1);
          setActiveCard(cardProgress, time >= firstCardStart);
        };

        if (title) gsapRuntime.set(title, { autoAlpha: 0, y: 38, scale: 0.985 });
        gsapRuntime.set(cards, { autoAlpha: 0, y: 28, scale: 0.96 });
        setActiveCard(0, false);

        const getPinDistance = () => {
          const isCompact = (stage.clientWidth || window.innerWidth || 0) <= 720;
          const viewportDistance = window.innerHeight * (isCompact ? 3.75 : 5.05);
          const cardDistance = (cards.length + 0.9) * (isCompact ? 300 : 430);
          return Math.max(viewportDistance, cardDistance);
        };

        ScrollTriggerRuntime.create({
          trigger: section,
          start: "top 82%",
          end: () => {
            const isCompact = (stage.clientWidth || window.innerWidth || 0) <= 720;
            const entryDistance = window.innerHeight * 0.74;
            const motionDistance = getPinDistance() + entryDistance;
            const minimumDistance = window.innerHeight * (isCompact ? 4.15 : 5.2);
            return `+=${Math.max(motionDistance, minimumDistance)}`;
          },
          scrub: true,
          invalidateOnRefresh: true,
          onEnter: loadTexturesOnce,
          onEnterBack: loadTexturesOnce,
          onUpdate: (self) => {
            renderContactRing(softenContactProgress(self.progress));
            updateLandingOffset();
          },
          onRefresh: (self) => {
            resizeRenderer();
            renderContactRing(softenContactProgress(self.progress));
            updateLandingOffset();
          },
        });

        const timeline = gsapRuntime.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            pin,
            start: "top top",
            end: () => `+=${getPinDistance()}`,
            scrub: 0.18,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onEnter: loadTexturesOnce,
            onEnterBack: loadTexturesOnce,
            onUpdate: (self) => syncActiveCard(self.progress),
            onRefresh: (self) => {
              resizeRenderer();
              updateLandingOffset();
              syncActiveCard(self.progress);
            },
          },
        });

        if (title) {
          timeline.to(title, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.42,
            ease: "power2.out",
          }, 0);
        }

        timeline.to(cards[0], {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.38,
          ease: "power2.out",
        }, firstCardStart);

        cards.forEach((card, index) => {
          const start = index === 0 ? firstCardStart : introDuration + index;
          if (index > 0) {
            timeline.to(card, {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.36,
              ease: "power2.out",
            }, start);
          }

          if (index < cards.length - 1) {
            const exitStart = index === 0 ? introDuration + 0.74 : start + 0.74;
            timeline.to(card, {
              autoAlpha: 0,
              y: -28,
              scale: 0.96,
              duration: 0.34,
              ease: "power1.inOut",
            }, exitStart);
          }
        });
      }, section);

      ScrollTriggerRuntime.refresh();
    };

    resizeRenderer();
    queueTextureLoading();
    window.addEventListener("resize", () => {
      resizeRenderer();
      ScrollTriggerRuntime.refresh();
    }, { passive: true });

    startContactRingAnimation = startPinnedContactRing;
    stopContactRingAnimation = () => {
      stopPinnedContactRing();
      showStaticContactRing();
    };

    if (prefersReducedMotion()) {
      showStaticContactRing();
    } else {
      startPinnedContactRing();
    }
  };

  const initCarousel = () => {
    const carouselWindows = Array.from(document.querySelectorAll(".carousel-window"));
    if (carouselWindows.length === 0) return;

    let isDocumentVisible = document.visibilityState !== "hidden";
    const baseSpeed = 0.032;
    const hoverSpeed = 0.008;
    const getTrackWidth = (track) => Math.max(
      track.getBoundingClientRect().width,
      track.scrollWidth,
      1
    );
    const referenceTrackWidth = carouselWindows.reduce((width, carouselWindow) => {
      if (width > 0) return width;
      const carouselTrack = carouselWindow.querySelector(".carousel-track");
      return carouselTrack ? getTrackWidth(carouselTrack) : 0;
    }, 0) || 1;

    const controllers = carouselWindows.map((carouselWindow) => {
      const carouselTrack = carouselWindow.querySelector(".carousel-track");
      if (!carouselTrack) return null;

      let progress = 0;
      let currentSpeed = baseSpeed;
      let speedScale = 1;
      let lastTime = 0;
      let carouselAnimationFrame = null;
      let isCarouselVisible = false;
      const isReverse = carouselWindow.dataset.direction === "reverse"
        || carouselTrack.classList.contains("carousel-track--reverse");

      const refreshSpeedScale = () => {
        speedScale = referenceTrackWidth / getTrackWidth(carouselTrack);
      };

      const applyCarouselTransform = () => {
        const offset = isReverse ? progress - 50 : -progress;
        carouselTrack.style.transform = `translateX(${offset}%)`;
      };

      const pauseCarouselAnimation = (reset = false) => {
        if (carouselAnimationFrame) {
          window.cancelAnimationFrame(carouselAnimationFrame);
          carouselAnimationFrame = null;
        }

        if (reset) {
          progress = 0;
          currentSpeed = baseSpeed;
          applyCarouselTransform();
        }
      };

      const animateCarousel = (time) => {
        if (prefersReducedMotion() || !isCarouselVisible || !isDocumentVisible) {
          pauseCarouselAnimation();
          return;
        }

        const delta = time - lastTime;
        lastTime = time;

        if (delta < 100) {
          progress += currentSpeed * speedScale * (delta / 16.66);
        }

        if (progress >= 50) {
          progress -= 50;
        }

        applyCarouselTransform();
        carouselAnimationFrame = window.requestAnimationFrame(animateCarousel);
      };

      const start = () => {
        if (carouselAnimationFrame || prefersReducedMotion() || !isCarouselVisible || !isDocumentVisible) {
          if (prefersReducedMotion()) pauseCarouselAnimation(true);
          return;
        }

        lastTime = performance.now();
        carouselAnimationFrame = window.requestAnimationFrame(animateCarousel);
      };

      const stop = () => {
        pauseCarouselAnimation(true);
      };

      carouselTrack.addEventListener("mouseenter", () => {
        currentSpeed = hoverSpeed;
      });
      carouselTrack.addEventListener("mouseleave", () => {
        currentSpeed = baseSpeed;
      });

      refreshSpeedScale();
      applyCarouselTransform();

      return {
        element: carouselWindow,
        pause: pauseCarouselAnimation,
        refreshSpeedScale,
        start,
        stop,
        setVisible: (isVisible) => {
          isCarouselVisible = isVisible;
          if (isCarouselVisible) {
            start();
          } else {
            pauseCarouselAnimation();
          }
        },
      };
    }).filter(Boolean);

    if (controllers.length === 0) return;

    startCarouselAnimation = () => {
      controllers.forEach((controller) => controller.start());
    };

    stopCarouselAnimation = () => {
      controllers.forEach((controller) => controller.stop());
    };

    window.addEventListener("resize", () => {
      controllers.forEach((controller) => controller.refreshSpeedScale());
    }, { passive: true });

    document.addEventListener("visibilitychange", () => {
      isDocumentVisible = document.visibilityState !== "hidden";
      if (isDocumentVisible) {
        startCarouselAnimation();
      } else {
        controllers.forEach((controller) => controller.pause());
      }
    });

    if ("IntersectionObserver" in window) {
      const controllerByElement = new Map(
        controllers.map((controller) => [controller.element, controller])
      );
      const carouselObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            controllerByElement.get(entry.target)?.setVisible(Boolean(entry.isIntersecting));
          });
        },
        { rootMargin: "160px 0px" }
      );

      controllers.forEach((controller) => {
        carouselObserver.observe(controller.element);
      });
    } else {
      controllers.forEach((controller) => controller.setVisible(true));
    }

    if (prefersReducedMotion()) {
      stopCarouselAnimation();
    }
  };

  initGlobalPointer();
  initDeskScene();
  initReveal();
  initTiltCards();
  initFeatureCards();
  initToolStack();
  initDock();
  initInteractiveHover();
  initLocationRotation();
  initBlogSequence();
  initContactRing();
  initHashScroll();
  initCarousel();

  reducedMotionQuery.addEventListener("change", (event) => {
    if (event.matches) {
      stopLocationRotation();
      stopCarouselAnimation();
      stopContactRingAnimation();
      cancelSmoothScroll();
      return;
    }

    startContactRingAnimation();

    const startPostEntranceMotion = () => {
      startLocationRotation();
      startCarouselAnimation();
    };

    if (root.classList.contains("page-entrance-complete")) {
      startPostEntranceMotion();
    } else {
      window.addEventListener("page-entrance-complete", startPostEntranceMotion, { once: true });
    }
  });
})();
