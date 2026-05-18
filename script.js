(() => {
  const root = document.documentElement;
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const prefersReducedMotion = () => reducedMotionQuery.matches;

  let startLocationRotation = () => {};
  let stopLocationRotation = () => {};
  let startCarouselAnimation = () => {};
  let stopCarouselAnimation = () => {};
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
      ".call-button, .small-call, .product-btn, .contact-card"
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
  initHashScroll();
  initCarousel();

  reducedMotionQuery.addEventListener("change", (event) => {
    if (event.matches) {
      stopLocationRotation();
      stopCarouselAnimation();
      cancelSmoothScroll();
      return;
    }

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
