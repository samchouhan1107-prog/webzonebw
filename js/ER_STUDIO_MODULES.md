# ER Studio Module Map

Keep the existing `js/` URLs stable: the Studio and demo pages load modules directly, and some of the same files are shared by other pages.

## Active `er/index.html` pipeline

| Responsibility | File | Ownership |
| --- | --- | --- |
| Camera, face tracking, filter application, canvas rendering, capture, and overlays | `halloween.js` | Active runtime owner for `#cameraVideo` and `#cameraCanvas`. |
| Theme persistence and camera playback recovery | `er-studio.js` | Page shell support only; does not acquire or own the camera stream. |
| Lens catalog, feature-pack metadata, and entitlements | `er-studio-pipeline.js` | Registry and licensing workflows; live filter switching remains in `halloween.js`. |
| Performance and interaction enhancements | `er-studio-enhanced.js`, `er-studio-controls.js` | Optional Studio UI enhancements loaded after the core pipeline. |
| Premium license flow | `er-license-premium.js` | Load before `halloween.js`, matching the current page contract. |

The shared navigation, consent, and site behavior scripts are loaded separately in `er/index.html` and are not part of the camera pipeline.

## Optional and alternate engines

| Responsibility | File | Integration status |
| --- | --- | --- |
| Face-filter environments | `facefilter-enhanced.js` | Separate environment/filter implementation; not loaded by the active Studio entry page. |
| Environment renderer | `enhanced-filter-environment.js` | Loaded by `er-enhanced-demo.html`; keep isolated from the active Studio renderer. |
| Environment-to-filter bridge | `enhanced-filter-integration.js`, `filter-environment-upgrade.js` | Optional integration scripts; verify their expected globals and page before adding them to a script list. |
| Alternate full Studio renderer | `halloween-enhanced.js` | Alternative to `halloween.js`, not an additional active renderer. |
| Unified face detector and lens scaling | `unified-lens-scaling.js`, `unified-lens-integration.js` | Separate pipeline that replaces renderer functions and owns its own face state. Do not load beside `halloween.js` without an explicit migration. |
| Enhanced platform integration | `enhanced-studio-platform.js` | Alternate platform layer with its own camera/canvas initialization assumptions. |

## Maintenance rules

- Preserve the `#cameraVideo` and `#cameraCanvas` IDs while the active `halloween.js` runtime owns rendering.
- Keep the license manager ahead of `halloween.js` in the page's deferred script order.
- Treat alternate engines as mutually exclusive until their camera acquisition, detection state, and render loop are deliberately consolidated.
- When promoting an optional module, verify its globals, initialization order, and target DOM IDs on the actual page before wiring it into `er/index.html`.