var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
(function (sm) {
    // https://github.com/DVLP/localStorageDB - Allows use of indexedDB with a simple localStorage-like wrapper
    // @ts-ignore
    !function () { var s, c, e = "undefined" != typeof window ? window : {}, t = e.indexedDB || e.mozIndexedDB || e.webkitIndexedDB || e.msIndexedDB; "undefined" == typeof window || t ? ((t = t.open("ldb", 1)).onsuccess = function (e) { s = this.result; }, t.onerror = function (e) { console.error("indexedDB request error"), console.log(e); }, t = { get: (c = { ready: !(t.onupgradeneeded = function (e) { s = null, e.target.result.createObjectStore("s", { keyPath: "k" }).transaction.oncomplete = function (e) { s = e.target.db; }; }), get: function (e, t) { s ? s.transaction("s").objectStore("s").get(e).onsuccess = function (e) { e = e.target.result && e.target.result.v || null; t(e); } : setTimeout(function () { c.get(e, t); }, 50); }, set: function (t, n, o) { if (s) {
                var e_1 = s.transaction("s", "readwrite");
                e_1.oncomplete = function (e) { "Function" === {}.toString.call(o).slice(8, -1) && o(); }, e_1.objectStore("s").put({ k: t, v: n }), e_1.commit();
            }
            else
                setTimeout(function () { c.set(t, n, o); }, 50); }, delete: function (e, t) { s ? s.transaction("s", "readwrite").objectStore("s").delete(e).onsuccess = function (e) { t && t(); } : setTimeout(function () { c.delete(e, t); }, 50); }, list: function (t) { s ? s.transaction("s").objectStore("s").getAllKeys().onsuccess = function (e) { e = e.target.result || null; t(e); } : setTimeout(function () { c.list(t); }, 50); }, getAll: function (t) { s ? s.transaction("s").objectStore("s").getAll().onsuccess = function (e) { e = e.target.result || null; t(e); } : setTimeout(function () { c.getAll(t); }, 50); }, clear: function (t) { s ? s.transaction("s", "readwrite").objectStore("s").clear().onsuccess = function (e) { t && t(); } : setTimeout(function () { c.clear(t); }, 50); } }).get, set: c.set, delete: c.delete, list: c.list, getAll: c.getAll, clear: c.clear }, sm.ldb = t, "undefined" != typeof module && (module.exports = t)) : console.error("indexDB not supported"); }();
    // enum Group{History = "history", Favourites = "Favourites"}
    // const txt2imgGenerationSettingSelectors = {
    //     prompt: '#txt2img_prompt textarea',
    //     negativePrompt: '#txt2img_neg_prompt textarea',
    //     sampler: '#txt2img_sampling input',
    //     steps: '#txt2img_steps input',
    //     width: '#txt2img_width input',
    //     height: '#txt2img_height input',
    //     batchCount: '#txt2img_batch_count input',
    //     batchSize: '#txt2img_batch_size input',
    //     cfg: '#txt2img_cfg_scale input',
    //     seed: '#txt2img_seed input',
    //     showSubseed: '#txt2img_subseed_show input',
    //     subseed: '#txt2img_subseed input',
    //     subseedStrength: '#txt2img_subseed_strength input',
    //     resizeSeedFromWidth: '#txt2img_seed_resize_from_w input',
    //     resizeSeedFromHeight: '#txt2img_seed_resize_from_h input',
    // };
    // // img2img is just all the same params with different prefix + scale and denoise strength
    // const img2imgGenerationSettingSelectors = Object.assign({
    //     scale: '#img2img_scale input',
    //     denoisingStrength: '#img2img_denoising_strength input'
    // }, txt2imgGenerationSettingSelectors);
    // for(let option in img2imgGenerationSettingSelectors){
    //     img2imgGenerationSettingSelectors[option] = img2imgGenerationSettingSelectors[option].replace('txt2img', 'img2img');
    // }
    var looselyEqualUIValues = new Set([null, undefined, "", "None"]);
    var app = gradioApp();
    // const serializeInputTypes = ['text', 'number', 'range', 'checkbox', 'radio', 'dropdown'];//, 'fieldset']; //old impl
    // const specialCaseComponents = {
    //     hasVisibleCheckbox: ["Hires. fix", "Enable"] //Terrible naming; "enable" = "use refiner"
    // };
    // const maxEntriesPerPage = 80;
    var maxEntriesPerPage = {
        docked: 80,
        modal: 400
    };
    var entryEventListenerAbortController = new AbortController();
    // sm.initStorage();
    sm.autoSaveHistory = true;
    sm.lastHeadImage = null;
    sm.lastUsedState = null;
    sm.componentMap = {};
    sm.ldb.get('sd-webui-state-manager-autosave', function (autosave) {
        if (autosave == null) {
            return;
        }
        sm.autosave = autosave;
        var autosaveCheckbox = app.querySelector('#sd-webui-sm-autosave');
        if (autosaveCheckbox) {
            autosaveCheckbox.checked = autosave;
        }
    });
    sm.entryFilter = {
        group: 'history',
        types: ['txt2img', 'img2img'],
        query: '',
        matches: function (data) {
            var f = sm.entryFilter;
            // const q = f.query.toLowerCase();
            var queries = f.query.toLowerCase().split(/, */);
            return data.groups.indexOf(f.group) > -1 && f.types.indexOf(data.type) > -1 &&
                (f.query == '' || queries.every(function (q) { return data.quickSettings['Stable Diffusion checkpoint'].toLowerCase().indexOf(q) > -1 || data.generationSettings.sampler.toLowerCase().indexOf(q) > -1 ||
                    data.generationSettings.prompt.toLowerCase().indexOf(q) > -1 || data.generationSettings.negativePrompt.toLowerCase().indexOf(q) > -1 ||
                    (data.hasOwnProperty('name') && data.name.toLowerCase().indexOf(q) > -1); }));
        }
    };
    sm.currentPage = 0;
    sm.injectUI = function () {
        // I really want to reuse some of the generated `svelte-xxxxxx` components, but these names have been known to change in the past (https://github.com/AUTOMATIC1111/stable-diffusion-webui/discussions/10076)
        // To get around this, we find the target elements and extract the classname for this version of the app.
        // It's still fragile af, just... slightly less so?
        var _this = this;
        // @ts-ignore
        var svelteClassFromSelector = function (selector) { return Array.from(Array.from(app.querySelectorAll(selector)).find(function (el) { return Array.from(el.classList).flat().find(function (cls) { return cls.startsWith('svelte-'); }); }).classList).find(function (cls) { return cls.startsWith('svelte-'); }); };
        sm.svelteClasses = {
            button: svelteClassFromSelector('.lg.secondary.gradio-button.tool'),
            tab: svelteClassFromSelector('#tabs'),
            checkbox: svelteClassFromSelector('input[type=checkbox]'),
            prompt: svelteClassFromSelector('#txt2img_prompt label')
        };
        function createQuickSettingsButton(type, secondaryIconText, onClick) {
            var quickSettingsButton = sm.createElementWithInnerTextAndClassList('button', '⌛', 'lg', 'sd-webui-sm-quicksettings-button', 'secondary', 'gradio-button', 'tool', sm.svelteClasses.button);
            quickSettingsButton.id = "sd-webui-sm-quicksettings-button-".concat(type);
            quickSettingsButton.appendChild(sm.createElementWithInnerTextAndClassList('div', secondaryIconText, 'icon'));
            app.querySelector('#quicksettings').appendChild(quickSettingsButton);
            quickSettingsButton.addEventListener('click', onClick);
            return quickSettingsButton;
        }
        createQuickSettingsButton('toggle', '⚙', sm.toggle);
        var quickSettingSaveMenu = sm.createElementWithClassList('div', 'sd-webui-sm-save-menu');
        quickSettingSaveMenu.style.display = 'none';
        var quickSettingSaveButton = createQuickSettingsButton('save', '💾', function () {
            // quickSettingSaveMenu.style.display = quickSettingSaveMenu.style.display == 'none' ? 'block' : 'none';
            if (quickSettingSaveMenu.style.display == 'none') {
                quickSettingSaveMenu.style.display = 'block';
                quickSettingSaveMenu.style.left = '0';
                var right = quickSettingSaveMenu.getBoundingClientRect().right;
                if (right > window.innerWidth) {
                    quickSettingSaveMenu.style.left = "calc(".concat(window.innerWidth - right, "px - 1em)");
                }
            }
            else {
                quickSettingSaveMenu.style.display = 'none';
            }
        });
        quickSettingSaveButton.addEventListener('blur', function (e) {
            if (!e.currentTarget.contains(e.relatedTarget)) { // not a child button that was clicked
                quickSettingSaveMenu.style.display = 'none';
            }
        });
        var quickSettingSaveCurrentButton = sm.createElementWithInnerTextAndClassList('button', 'Save current UI settings', 'lg', 'secondary', 'gradio-button', 'tool', 'svelte-cmf5ev');
        var quickSettingSaveGeneratedButton = sm.createElementWithInnerTextAndClassList('button', 'Save last generation settings', 'lg', 'secondary', 'gradio-button', 'tool', 'svelte-cmf5ev');
        quickSettingSaveMenu.appendChild(quickSettingSaveCurrentButton);
        quickSettingSaveMenu.appendChild(quickSettingSaveGeneratedButton);
        quickSettingSaveButton.appendChild(quickSettingSaveMenu);
        var quickSettingSaveButtonBlur = function (e) {
            if (!e.currentTarget.parentNode.contains(e.relatedTarget)) { // lost focus to an element outside the save buttons
                quickSettingSaveMenu.style.display = 'none';
            }
        };
        var showQuickSettingSaveButtonSuccess = function (success) {
            var quickSettingsSaveButtonIconText = app.querySelector('#sd-webui-sm-quicksettings-button-save .icon');
            if (success) {
                quickSettingsSaveButtonIconText.innerText = '✓';
                quickSettingsSaveButtonIconText.style.color = '#1fbb1f';
            }
            else {
                quickSettingsSaveButtonIconText.innerText = '✖';
                quickSettingsSaveButtonIconText.style.color = '#e63d3d';
                quickSettingsSaveButtonIconText.parentNode.classList.add('sd-webui-sm-shake');
            }
            setTimeout(function () {
                quickSettingsSaveButtonIconText.innerText = '💾';
                quickSettingsSaveButtonIconText.style.color = '#ffffff';
                quickSettingsSaveButtonIconText.parentNode.classList.remove('sd-webui-sm-shake');
            }, 2000);
        };
        quickSettingSaveCurrentButton.addEventListener('click', function () { return __awaiter(_this, void 0, void 0, function () {
            var currentState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(uiCurrentTab.innerText == 'txt2img' || uiCurrentTab.innerText == 'img2img')) return [3 /*break*/, 2];
                        return [4 /*yield*/, sm.getCurrentState(uiCurrentTab.innerText)];
                    case 1:
                        currentState = _a.sent();
                        currentState.name = "Saved UI " + new Date().toISOString().replace('T', ' ').replace(/\.\d+Z/, '');
                        currentState.preview = new Error().stack.match((/(http(.)+)\/javascript\/[a-zA-Z0-9]+\.js/))[1] + "/resources/icon-saved-ui.png";
                        sm.saveState(currentState, 'favourites');
                        showQuickSettingSaveButtonSuccess(true); //TODO: verify it actually saved. Catch storage errors etc.
                        sm.updateEntries();
                        return [3 /*break*/, 3];
                    case 2:
                        showQuickSettingSaveButtonSuccess(false);
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        quickSettingSaveCurrentButton.addEventListener('blur', quickSettingSaveButtonBlur);
        quickSettingSaveGeneratedButton.addEventListener('click', function () {
            if (sm.lastUsedState) {
                sm.saveLastUsedState();
                showQuickSettingSaveButtonSuccess(true); //TODO: verify it actually saved. Catch storage errors etc.
                sm.updateEntries();
            }
            else {
                showQuickSettingSaveButtonSuccess(false);
            }
        });
        quickSettingSaveGeneratedButton.addEventListener('blur', quickSettingSaveButtonBlur);
        sm.panelContainer = sm.createElementWithClassList('div', 'sd-webui-sm-panel-container');
        var panel = sm.createElementWithClassList('div', 'sd-webui-sm-side-panel');
        var nav = sm.createElementWithClassList('div', 'sd-webui-sm-navigation');
        sm.inspector = sm.createElementWithClassList('div', 'sd-webui-sm-inspector');
        // Tabs
        var navTabs = sm.createElementWithClassList('div', 'tabs', 'gradio-tabs', sm.svelteClasses.tab);
        function createNavTab(label, group, isSelected) {
            var button = sm.createElementWithClassList('button', sm.svelteClasses.tab);
            button.innerText = label;
            if (isSelected) {
                button.classList.add('selected');
            }
            navTabs.appendChild(button);
            button.addEventListener('click', function () {
                button.parentNode.querySelectorAll('button').forEach(function (b) { return b.classList.toggle('selected', b == button); });
                sm.entryFilter.group = group;
                sm.updateEntries();
            });
        }
        createNavTab('History', 'history', true);
        createNavTab('Favourites', 'favourites');
        var autosaveContainer = sm.createElementWithClassList('div', 'sd-webui-sm-quicksetting');
        var autosaveCheckbox = sm.createElementWithClassList('input', sm.svelteClasses.checkbox);
        autosaveCheckbox.id = 'sd-webui-sm-autosave';
        autosaveCheckbox.type = 'checkbox';
        autosaveCheckbox.checked = sm.autosave;
        var autosaveLabel = sm.createElementWithInnerTextAndClassList('label', 'Auto-save');
        autosaveLabel.htmlFor = 'sd-webui-sm-autosave';
        autosaveContainer.appendChild(autosaveCheckbox);
        autosaveContainer.appendChild(autosaveLabel);
        autosaveCheckbox.addEventListener('change', function () {
            sm.autoSaveHistory = !sm.autoSaveHistory;
            sm.ldb.set('sd-webui-state-manager-autosave', sm.autoSaveHistory);
        });
        // navTabs.appendChild(autosaveContainer);
        var navControlButtons = sm.createElementWithClassList('div', 'sd-webui-sm-control');
        navControlButtons.appendChild(autosaveContainer);
        // const navButtonOptions = '⚙';
        var navButtonMode = sm.createElementWithClassList('button', 'sd-webui-sm-inspector-mode');
        navControlButtons.appendChild(navButtonMode);
        // navButtonMode.addEventListener('click', () => panel.classList.toggle('sd-webui-sm-modal-panel'));
        navButtonMode.addEventListener('click', function () {
            sm.panelContainer.classList.toggle('sd-webui-sm-modal-panel');
            if (sm.panelContainer.classList.contains('sd-webui-sm-modal-panel')) {
                sm.goToPage(Math.floor(sm.currentPage / (maxEntriesPerPage.modal / maxEntriesPerPage.docked)));
            }
            else {
                sm.goToPage(Math.floor(sm.currentPage * (maxEntriesPerPage.modal / maxEntriesPerPage.docked)));
            }
        });
        panel.addEventListener('click', function (e) { return e.stopPropagation(); });
        sm.panelContainer.addEventListener('click', sm.toggle);
        var navButtonClose = sm.createElementWithInnerTextAndClassList('button', '✖');
        navControlButtons.appendChild(navButtonClose);
        navButtonClose.addEventListener('click', sm.toggle);
        navTabs.appendChild(navControlButtons);
        // navTabs.appendChild(navToggleTxt2Img);
        // navTabs.appendChild(navToggleImg2Img);
        nav.appendChild(navTabs);
        // Entry container
        var entryContainer = sm.createElementWithClassList('div', 'sd-webui-sm-entry-container');
        // Search + pagination
        var entryHeader = sm.createElementWithClassList('div', 'sd-webui-sm-entry-header');
        var search = sm.createElementWithClassList('input');
        search.type = 'text';
        search.placeholder = "Filter by name, tokens, model or sampler";
        var searchChangeCallback = function () {
            sm.entryFilter.query = search.value;
            sm.updateEntries();
        };
        search.addEventListener('input', searchChangeCallback);
        search.addEventListener('change', searchChangeCallback);
        entryHeader.appendChild(sm.createElementWithInnerTextAndClassList('span', '🔍', 'sd-webui-sm-icon'));
        entryHeader.appendChild(search);
        var entryFooter = sm.createElementWithClassList('div', 'sd-webui-sm-entry-footer');
        sm.pageButtonNavigation = sm.createElementWithClassList('div', 'button-navigation');
        sm.pageButtonNavigation.appendChild(sm.createElementWithInnerTextAndClassList('button', '❮❮', 'jump-button'));
        sm.pageButtonNavigation.appendChild(sm.createElementWithInnerTextAndClassList('button', '❮', 'jump-button'));
        sm.pageButtonNavigation.appendChild(sm.createElementWithInnerTextAndClassList('button', '8', 'number-button'));
        sm.pageButtonNavigation.appendChild(sm.createElementWithInnerTextAndClassList('button', '9', 'number-button'));
        sm.pageButtonNavigation.appendChild(sm.createElementWithInnerTextAndClassList('button', '10', 'number-button'));
        sm.pageButtonNavigation.appendChild(sm.createElementWithInnerTextAndClassList('button', '11', 'number-button'));
        sm.pageButtonNavigation.appendChild(sm.createElementWithInnerTextAndClassList('button', '12', 'number-button'));
        sm.pageButtonNavigation.appendChild(sm.createElementWithInnerTextAndClassList('button', '❯', 'jump-button'));
        sm.pageButtonNavigation.appendChild(sm.createElementWithInnerTextAndClassList('button', '❯❯', 'jump-button'));
        // <<
        sm.pageButtonNavigation.childNodes[0].addEventListener('click', function () { return sm.goToPage(0); });
        sm.pageButtonNavigation.childNodes[1].addEventListener('click', function () { return sm.goToPage(Math.max(sm.currentPage - 1, 0)); });
        var textNavigation = sm.createElementWithClassList('div', 'text-navigation');
        textNavigation.appendChild(sm.createElementWithInnerTextAndClassList('span', 'Page'));
        sm.pageNumberInput = document.createElement('input');
        sm.pageNumberInput.type = 'number';
        sm.pageNumberInput.min = 1;
        sm.pageNumberInput.max = 999;
        sm.pageNumberInput.value = 1;
        sm.pageNumberInput.required = true;
        textNavigation.appendChild(sm.pageNumberInput);
        sm.maxPageNumberLabel = sm.createElementWithInnerTextAndClassList('span', 'of 1');
        textNavigation.appendChild(sm.maxPageNumberLabel);
        var handlePageInput = function () {
            sm.goToPage(Math.min(Math.max(sm.pageNumberInput.value.replaceAll(/[^\d]/g, '') - 1, sm.pageNumberInput.min), sm.pageNumberInput.max) || 0);
        };
        sm.pageNumberInput.addEventListener('change', handlePageInput);
        sm.pageNumberInput.addEventListener('blur', handlePageInput);
        entryFooter.appendChild(sm.pageButtonNavigation);
        entryFooter.appendChild(textNavigation);
        function createFilterToggle(type) {
            return sm.createPillToggle(type, true, '', "sd-webui-sm-filter-".concat(type), function (isOn) {
                var typeIndex = sm.entryFilter.types.indexOf(type);
                if (isOn && typeIndex == -1) {
                    sm.entryFilter.types.push(type);
                }
                else if (!isOn && typeIndex > -1) {
                    sm.entryFilter.types.splice(typeIndex, 1);
                }
                sm.updateEntries();
            }, false);
        }
        entryHeader.appendChild(createFilterToggle('txt2img'));
        entryHeader.appendChild(createFilterToggle('img2img'));
        // Entries
        var entries = sm.createElementWithClassList('div', 'sd-webui-sm-entries');
        entryContainer.appendChild(entryHeader);
        entryContainer.appendChild(entries);
        entryContainer.appendChild(entryFooter);
        for (var i = 0; i < maxEntriesPerPage.modal; i++) { // Max amount of entries per page
            var entry = sm.createElementWithClassList('button', 'sd-webui-sm-entry');
            entry.style.display = 'none';
            entry.appendChild(sm.createElementWithClassList('div', 'type'));
            entries.appendChild(entry);
        }
        // Add to DOM
        panel.appendChild(nav);
        panel.appendChild(entryContainer);
        panel.appendChild(sm.inspector);
        sm.panelContainer.appendChild(panel);
        app.querySelector('.contain').appendChild(sm.panelContainer);
        // Event listeners
        // app.querySelector('#txt2img_generate').addEventListener('click', () => sm.lastUsedState = sm.getCurrentState('txt2img'));
        // app.querySelector('#img2img_generate').addEventListener('click', () => sm.lastUsedState = sm.getCurrentState('img2img'));
        // Use above listeners for a less invasive button listener. But if we wanna catch ctrl+enter generation as well...
        var originalSubmit = submit;
        submit = function () {
            return __awaiter(this, arguments, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = sm;
                            return [4 /*yield*/, sm.getCurrentState('txt2img')];
                        case 1:
                            _a.lastUsedState = _b.sent();
                            return [2 /*return*/, originalSubmit.apply(void 0, arguments)];
                    }
                });
            });
        };
        var originaSubmitImg2img = submit_img2img;
        submit_img2img = function () {
            return __awaiter(this, arguments, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = sm;
                            return [4 /*yield*/, sm.getCurrentState('img2img')];
                        case 1:
                            _a.lastUsedState = _b.sent();
                            return [2 /*return*/, originaSubmitImg2img.apply(void 0, arguments)];
                    }
                });
            });
        };
        sm.updateEntries();
    };
    sm.createPillToggle = function (label, isOn, id, checkboxId, onchange, immediatelyCallOnChange) {
        var container = sm.createElementWithClassList('div', 'sd-webui-sm-pill-toggle');
        container.id = id;
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = isOn;
        checkbox.id = checkboxId;
        // navToggleImg2Img.innerText = "img2img";
        // checkbox.innerText = "img2img";
        var labelElement = document.createElement('label');
        labelElement.htmlFor = checkbox.id;
        labelElement.innerText = label;
        container.appendChild(checkbox);
        container.appendChild(labelElement);
        checkbox.addEventListener('change', function () { return onchange(checkbox.checked); });
        if (immediatelyCallOnChange) {
            onchange(checkbox.checked);
        }
        return container;
    };
    sm.toggle = function () {
        app.querySelector('.sd-webui-sm-panel-container').classList.toggle('open');
    };
    sm.getMode = function () {
        return sm.panelContainer.classList.contains('sd-webui-sm-modal-panel') ? 'modal' : 'docked';
    };
    sm.goToPage = function (page) {
        sm.currentPage = page;
        sm.pageNumberInput.value = page + 1;
        sm.updateEntries();
    };
    sm.updateEntries = function () {
        if (!sm.hasOwnProperty('memoryStorage')) { // Storage not init'd yet, defer until it's ready
            sm.updateEntriesWhenStorageReady = true;
            return;
        }
        // Clear old listeners
        entryEventListenerAbortController.abort();
        entryEventListenerAbortController = new AbortController();
        var currentMaxEntriesPerPage = maxEntriesPerPage[sm.getMode()];
        var entries = sm.panelContainer.querySelector('.sd-webui-sm-entries');
        var filteredData = Object.fromEntries(Object.entries(sm.memoryStorage.entries.data).filter(function (kv) { return sm.entryFilter.matches(kv[1]); }));
        var filteredKeys = Object.keys(filteredData).sort().reverse();
        var numPages = Math.max(Math.ceil(filteredKeys.length / currentMaxEntriesPerPage), 1);
        sm.pageNumberInput.max = numPages;
        sm.maxPageNumberLabel.innerText = "of ".concat(numPages);
        if (sm.currentPage >= numPages) {
            sm.currentPage = numPages - 1;
            sm.pageNumberInput.value = numPages;
        }
        var endPagesCorrection = Math.max(3 - (numPages - sm.currentPage), 0);
        var pageButtonStart = Math.max(sm.currentPage - 2 - endPagesCorrection, 0); // 0-indexed, not by label
        var _loop_1 = function (i) {
            var pageButton = sm.pageButtonNavigation.childNodes[2 + i];
            var pageNumber = pageButtonStart + i;
            if (pageNumber < numPages) {
                pageButton.innerText = pageNumber + 1;
                pageButton.style.display = 'inline-block';
                pageButton.classList.toggle('active', pageNumber == sm.currentPage);
                pageButton.addEventListener('click', function () {
                    sm.goToPage(pageNumber);
                }, { signal: entryEventListenerAbortController.signal });
            }
            else {
                pageButton.style.display = 'none';
            }
        };
        for (var i = 0; i < 5; i++) {
            _loop_1(i);
        }
        // >
        sm.pageButtonNavigation.childNodes[7].addEventListener('click', function () {
            sm.goToPage(Math.min(sm.currentPage + 1, numPages));
        }, { signal: entryEventListenerAbortController.signal });
        // >>
        sm.pageButtonNavigation.childNodes[8].addEventListener('click', function () {
            sm.goToPage(numPages);
        }, { signal: entryEventListenerAbortController.signal });
        var dataPageOffset = sm.currentPage * currentMaxEntriesPerPage;
        var numEntries = Math.min(currentMaxEntriesPerPage, filteredKeys.length - dataPageOffset);
        var _loop_2 = function (i) {
            var data = sm.memoryStorage.entries.data[filteredKeys[dataPageOffset + i]];
            var entry = entries.childNodes[i];
            entry.data = data;
            entry.style.backgroundImage = "url(\"".concat(data.preview, "\")");
            entry.style.display = 'inherit';
            // entry.innerText = data.preview ? '' : data.generationSettings.prompt;
            entry.childNodes[0].innerText = "".concat(data.type == 'txt2img' ? '🖋' : '🖼️', " ").concat(data.type);
            sm.updateEntryIndicators(entry);
            entry.addEventListener('click', function (e) {
                if (e.shiftKey) {
                    sm.selection.select(entry, 'range');
                }
                else if (e.ctrlKey || e.metaKey) {
                    sm.selection.select(entry, 'add');
                }
                else {
                    // entries.querySelector('.active')?.classList.remove('active');
                    // entry.classList.add('active');
                    sm.selection.select(entry, 'single');
                }
                // sm.updateInspector();
            }, { signal: entryEventListenerAbortController.signal });
            entry.addEventListener('dblclick', function () { return sm.applyAll(data); }, { signal: entryEventListenerAbortController.signal });
        };
        for (var i = 0; i < numEntries; i++) {
            _loop_2(i);
        }
        for (var i = numEntries; i < maxEntriesPerPage.modal; i++) {
            entries.childNodes[i].style.display = 'none';
        }
    };
    sm.updateEntryIndicators = function (entry) {
        entry.classList.toggle('favourite', entry.data.groups.indexOf('favourites') > -1);
        entry.classList.toggle('named', entry.data.hasOwnProperty('name') && entry.data.name != undefined && entry.data.name.length > 0);
    };
    // sm.select = function(entry, type){
    //     switch(type){
    //         case 'single':
    //             sm.selection 
    //             break;
    //         case 'add':
    //             break;
    //         case 'range':
    //             break;
    //     }
    // }
    sm.updateInspector = function () {
        return __awaiter(this, void 0, void 0, function () {
            function createQuickSetting(label, settingPath) {
                var quickSettingParameter = sm.createInspectorParameter(label, entry.data.quickSettings[settingPath], function () { return sm.applyQuickParameters(entry.data.quickSettings, settingPath); });
                if (sm.componentMap.hasOwnProperty(settingPath)) {
                    quickSettingParameter.dataset['valueDiff'] = (sm.componentMap[settingPath].component.instance.$$.ctx[0] == entry.data.quickSettings[settingPath] ? 'same' : 'changed');
                }
                else {
                    quickSettingParameter.dataset['valueDiff'] = 'missing';
                }
                quickSettingsContainer.appendChild(quickSettingParameter);
                return quickSettingParameter;
            }
            function getSavedValue(settingPath) {
                return entry.data.componentSettings.hasOwnProperty(settingPath) ? entry.data.componentSettings[settingPath] : sm.memoryStorage.savedDefaults[entry.data.defaults][settingPath];
            }
            // function isLooselyEqualValue(value1: any, value2: any): boolean{
            //     return value1 == value2 || (looselyEqualUIValues.has(value1) && looselyEqualUIValues.has(value2));
            // }
            function areLooselyEqualValue() {
                var values = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    values[_i] = arguments[_i];
                }
                var qualifiesForLooseComparison = looselyEqualUIValues.has(values[0]);
                return values.reduce(function (isEqual, value) { return isEqual && (value == values[0] || (qualifiesForLooseComparison && looselyEqualUIValues.has(value))); }, true);
            }
            function setValueDiffAttribute(element, settingPath, value) {
                if (sm.componentMap.hasOwnProperty(settingPath)) {
                    element.dataset['valueDiff'] = (sm.componentMap[settingPath].component.props.value == value ? 'same' : 'changed');
                }
                else {
                    element.dataset['valueDiff'] = 'missing';
                }
            }
            function createCompositeInspectorParameter(label, displayValueFormatter, settingPaths) {
                settingPaths.forEach(curatedSettingNames.add.bind(curatedSettingNames));
                var valueMap = settingPaths.reduce(function (values, settingPath) { values[settingPath] = getSavedValue(settingPath); return values; }, {});
                return sm.createInspectorParameter(label, displayValueFormatter(valueMap), function () { return sm.applyComponentSettings(valueMap); });
            }
            function _createGenerationInspectorParameter(label, settingPath, factory) {
                curatedSettingNames.add(settingPath);
                var value = getSavedValue(settingPath);
                var parameter = factory(label, value, function () {
                    var _a;
                    return sm.applyComponentSettings((_a = {}, _a[settingPath] = value, _a));
                });
                setValueDiffAttribute(parameter, settingPath, value);
                return parameter;
            }
            function createGenerationInspectorPromptParameter(label, settingPath) {
                return _createGenerationInspectorParameter(label, settingPath, sm.createInspectorPromptSection);
            }
            function createGenerationInspectorParameter(label, settingPath) {
                return _createGenerationInspectorParameter(label, settingPath, sm.createInspectorParameter);
            }
            var multiSelectContainer, favouriteAllButton, deleteAllButton, entry, metaContainer, nameField, favButton, deleteButton, loadAllButton, viewSettingsContainer, nameChangeCallback, quickSettingLabelRenames, mandatoryQuickSettings, miscQuickSettings, quickSettingsContainer, _i, mandatoryQuickSettings_1, settingName, quickSettingParameter, valueField, checkpointHash, _a, miscQuickSettings_1, settingName, savedComponentSettings, savedComponentDefaults, curatedSettingNames, generationSettingsContent, getRootSettingName, getScriptSettingName, hasSubseed, hasHiresFix, hasRefiner, hiresFixSettingsContent, refinersSettingsContent, mergedComponentSettings, sectionName, savedSettingNames, _b, savedSettingNames_1, settingName, value, settingPath, sectionName, settingName, settingPath, value, sectionName, prettyLabelName, sectionSettingsContainer;
            return __generator(this, function (_c) {
                sm.inspector.innerHTML = "";
                if (sm.selection.entries.length == 0) {
                    return [2 /*return*/];
                }
                else if (sm.selection.entries.length > 1) {
                    multiSelectContainer = sm.createElementWithClassList('div', 'category', 'meta-container');
                    favouriteAllButton = sm.createElementWithInnerTextAndClassList('button', "\u2665 Favourite all ".concat(sm.selection.entries.length, " selected items"), 'sd-webui-sm-inspector-wide-button', 'sd-webui-sm-inspector-load-button');
                    deleteAllButton = sm.createElementWithInnerTextAndClassList('button', "\uD83D\uDDD1 Delete all ".concat(sm.selection.entries.length, " selected items"), 'sd-webui-sm-inspector-wide-button', 'sd-webui-sm-inspector-load-button');
                    multiSelectContainer.appendChild(favouriteAllButton);
                    multiSelectContainer.appendChild(deleteAllButton);
                    favouriteAllButton.addEventListener('click', function () {
                        var addOrRemove = sm.selection.entries.every(function (e) { return e.data.groups && e.data.groups.indexOf('favourites') > -1; }) ? sm.removeStateFromGroup : sm.addStateToGroup;
                        for (var _i = 0, _a = sm.selection.entries; _i < _a.length; _i++) {
                            var entry_1 = _a[_i];
                            addOrRemove(entry_1.data.createdAt, 'favourites');
                            sm.updateEntryIndicators(entry_1);
                        }
                    });
                    deleteAllButton.addEventListener('click', function () {
                        sm.deleteStates.apply(sm, __spreadArray([true], sm.selection.entries.map(function (e) { return e.data.createdAt; }), false));
                        sm.updateEntries();
                    });
                    sm.inspector.appendChild(multiSelectContainer);
                    return [2 /*return*/];
                }
                entry = sm.selection.entries[0];
                metaContainer = sm.createElementWithClassList('div', 'category', 'meta-container');
                nameField = document.createElement('input');
                nameField.placeholder = "Give this config a name";
                nameField.type = 'text';
                nameField.value = entry.data.name || '';
                favButton = sm.createElementWithInnerTextAndClassList('button', '♥', 'sd-webui-sm-inspector-fav-button');
                deleteButton = sm.createElementWithInnerTextAndClassList('button', '🗑', 'sd-webui-sm-inspector-delete-button');
                loadAllButton = sm.createElementWithInnerTextAndClassList('button', 'Load all', 'sd-webui-sm-inspector-load-all-button', 'sd-webui-sm-inspector-load-button');
                favButton.classList.toggle('on', entry.data.groups && entry.data.groups.indexOf('favourites') > -1);
                metaContainer.appendChild(nameField);
                metaContainer.appendChild(favButton);
                metaContainer.appendChild(deleteButton);
                metaContainer.appendChild(loadAllButton);
                viewSettingsContainer = sm.createElementWithClassList('div', 'category', 'view-settings-container');
                // viewSettingsContainer.appendChild(sm.createPillToggle('◐', true, 'sd-webui-sm-inspector-view-coloured-labels', 'sd-webui-sm-inspector-view-coloured-labels-checkbox', (isOn: boolean) => sm.inspector.dataset['useColorCode'] = isOn, true));
                viewSettingsContainer.appendChild(sm.createPillToggle('', true, 'sd-webui-sm-inspector-view-coloured-labels', 'sd-webui-sm-inspector-view-coloured-labels-checkbox', function (isOn) { return sm.inspector.dataset['useColorCode'] = isOn; }, true));
                viewSettingsContainer.appendChild(sm.createPillToggle('unchanged', true, 'sd-webui-sm-inspector-view-unchanged', 'sd-webui-sm-inspector-view-unchanged-checkbox', function (isOn) { return sm.inspector.dataset['showUnchanged'] = isOn; }, true));
                viewSettingsContainer.appendChild(sm.createPillToggle('missing/obsolete', true, 'sd-webui-sm-inspector-view-missing', 'sd-webui-sm-inspector-view-missing-checkbox', function (isOn) { return sm.inspector.dataset['showMissing'] = isOn; }, true));
                viewSettingsContainer.appendChild(sm.createPillToggle('Try applying missing/obsolete', false, 'sd-webui-sm-inspector-apply-missing', 'sd-webui-sm-inspector-apply-missing-checkbox', function (isOn) { return sm.inspector.dataset['applyMissing'] = isOn; }, true));
                nameChangeCallback = function () {
                    sm.setStateName(entry.data.createdAt, nameField.value);
                    sm.updateEntryIndicators(entry);
                };
                nameField.addEventListener('input', nameChangeCallback);
                nameField.addEventListener('change', nameChangeCallback);
                favButton.addEventListener('click', function () {
                    if (!entry.data.groups || entry.data.groups.indexOf('favourites') == -1) {
                        sm.addStateToGroup(entry.data.createdAt, 'favourites');
                    }
                    else {
                        sm.removeStateFromGroup(entry.data.createdAt, 'favourites');
                    }
                    sm.updateEntryIndicators(entry);
                });
                deleteButton.addEventListener('click', function () {
                    sm.deleteStates(true, entry.data.createdAt);
                    sm.updateEntries();
                    if (entry.style.display != 'none') {
                        entry.click();
                    }
                });
                loadAllButton.addEventListener('click', function () { return sm.applyAll(entry.data); });
                sm.inspector.appendChild(metaContainer);
                sm.inspector.appendChild(viewSettingsContainer);
                quickSettingLabelRenames = {
                    'sd_model_checkpoint': 'Checkpoint',
                    'sd_vae': 'VAE',
                    'CLIP_stop_at_last_layers': 'CLIP skip',
                    'sd_hypernetwork': 'Hypernetwork',
                };
                mandatoryQuickSettings = Object.keys(quickSettingLabelRenames).filter(function (k) { return entry.data.quickSettings.hasOwnProperty(k); });
                miscQuickSettings = Object.keys(entry.data.quickSettings).filter(function (k) { return mandatoryQuickSettings.indexOf(k) == -1; });
                quickSettingsContainer = sm.createElementWithClassList('div', 'sd-webui-sm-inspector-category-content');
                for (_i = 0, mandatoryQuickSettings_1 = mandatoryQuickSettings; _i < mandatoryQuickSettings_1.length; _i++) {
                    settingName = mandatoryQuickSettings_1[_i];
                    quickSettingParameter = createQuickSetting(quickSettingLabelRenames[settingName], settingName);
                    if (settingName == 'sd_model_checkpoint') {
                        valueField = quickSettingParameter.querySelector('.param-value');
                        checkpointHash = valueField.innerText.match(/\[[a-f0-9]+\]/g);
                        valueField.innerText = valueField.innerText.replace(/\.safetensors|\.ckpt|\[[a-f0-9]+\]/g, '');
                        valueField.appendChild(sm.createElementWithInnerTextAndClassList('span', checkpointHash, 'hash'));
                    }
                }
                for (_a = 0, miscQuickSettings_1 = miscQuickSettings; _a < miscQuickSettings_1.length; _a++) {
                    settingName = miscQuickSettings_1[_a];
                    // console.log(`creating misc QSP with ${settingName} => ${entry.data.quickSettings[settingName]}`);
                    // quickSettingsContainer.appendChild(sm.createInspectorParameter(settingName, entry.data.quickSettings[settingName], () => sm.applyQuickParameters(entry.data.quickSettings, settingName)));
                    createQuickSetting(settingName, settingName);
                }
                // sm.inspector.appendChild(quickSettingsContainer);
                sm.inspector.appendChild(sm.createInspectorSettingsAccordion('Quick settings', quickSettingsContainer));
                savedComponentSettings = sm.utils.unflattenSettingsMap(entry.data.componentSettings);
                savedComponentDefaults = sm.utils.unflattenSettingsMap(sm.memoryStorage.savedDefaults[entry.data.defaults]);
                curatedSettingNames = new Set();
                generationSettingsContent = sm.createElementWithClassList('div', 'sd-webui-sm-inspector-category-content');
                getRootSettingName = function (settingName) { return "".concat(entry.data.type, "/").concat(settingName); };
                getScriptSettingName = function (scriptName, settingName) { return "customscript/".concat(scriptName, ".py/").concat(entry.data.type, "/").concat(settingName); };
                generationSettingsContent.appendChild(createGenerationInspectorPromptParameter('Prompt', getRootSettingName('Prompt')));
                generationSettingsContent.appendChild(createGenerationInspectorPromptParameter('Negative prompt', getRootSettingName('Negative prompt')));
                generationSettingsContent.appendChild(createCompositeInspectorParameter("Sampling", function (valueMap) { return "".concat(valueMap[getRootSettingName('Sampling method')], " (").concat(valueMap[getRootSettingName('Sampling steps')], " steps)"); }, [getRootSettingName('Sampling method'), getRootSettingName('Sampling steps')]));
                generationSettingsContent.appendChild(createCompositeInspectorParameter("Size", function (valueMap) { return "".concat(valueMap[getRootSettingName('Width')], " x ").concat(valueMap[getRootSettingName('Height')]); }, [getRootSettingName('Width'), getRootSettingName('Height')]));
                generationSettingsContent.appendChild(createCompositeInspectorParameter("Batches", function (valueMap) { return "".concat(valueMap[getRootSettingName('Batch count')], " x ").concat(valueMap[getRootSettingName('Batch size')]); }, [getRootSettingName('Batch count'), getRootSettingName('Batch size')]));
                generationSettingsContent.appendChild(createGenerationInspectorParameter("CFG Scale", getRootSettingName('CFG Scale')));
                generationSettingsContent.appendChild(createGenerationInspectorParameter("Seed", getScriptSettingName('seed', 'Seed')));
                generationSettingsContent.appendChild(createGenerationInspectorParameter("Use subseed", getScriptSettingName('seed', 'Extra')));
                hasSubseed = getSavedValue(getScriptSettingName('seed', 'Extra'));
                if (hasSubseed) {
                    generationSettingsContent.appendChild(createGenerationInspectorParameter("Variation seed", getScriptSettingName('seed', 'Variation seed')));
                    generationSettingsContent.appendChild(createGenerationInspectorParameter("Variation strength", getScriptSettingName('seed', 'Variation strength')));
                    generationSettingsContent.appendChild(createCompositeInspectorParameter("Resize seed from size", function (valueMap) { return "".concat(valueMap[getScriptSettingName('seed', 'Resize seed from width')], " x ").concat(valueMap[getScriptSettingName('seed', 'Resize seed from height')]); }, [getScriptSettingName('seed', 'Resize seed from width'), getScriptSettingName('seed', 'Resize seed from height')]));
                }
                generationSettingsContent.appendChild(createGenerationInspectorParameter("Hires. fix", getRootSettingName('Hires. fix')));
                generationSettingsContent.appendChild(createGenerationInspectorParameter("Refiner", getScriptSettingName('refiner', 'Refiner')));
                sm.inspector.appendChild(sm.createInspectorSettingsAccordion('Generation', generationSettingsContent));
                hasHiresFix = getSavedValue(getRootSettingName('Hires. fix'));
                hasRefiner = getSavedValue(getScriptSettingName('refiner', 'Refiner'));
                if (hasHiresFix) {
                    hiresFixSettingsContent = sm.createElementWithClassList('div', 'sd-webui-sm-inspector-category-content');
                    hiresFixSettingsContent.appendChild(createGenerationInspectorParameter("Enabled", getRootSettingName('Hires. fix')));
                    hiresFixSettingsContent.appendChild(createGenerationInspectorParameter("Upscaler", getRootSettingName('Upscaler')));
                    hiresFixSettingsContent.appendChild(createGenerationInspectorParameter("Steps", getRootSettingName('Hires steps')));
                    hiresFixSettingsContent.appendChild(createGenerationInspectorParameter("Denoising strength", getRootSettingName('Denoising strength')));
                    hiresFixSettingsContent.appendChild(createGenerationInspectorParameter("Upscale by", getRootSettingName('Upscale by')));
                    hiresFixSettingsContent.appendChild(createGenerationInspectorParameter("Checkpoint", getRootSettingName('Hires checkpoint')));
                    hiresFixSettingsContent.appendChild(createGenerationInspectorParameter("Sampling method", getRootSettingName('Hires sampling method')));
                    hiresFixSettingsContent.appendChild(createGenerationInspectorPromptParameter('Prompt', getRootSettingName('Hires prompt')));
                    hiresFixSettingsContent.appendChild(createGenerationInspectorPromptParameter('Negative prompt', getRootSettingName('Hires negative prompt')));
                    sm.inspector.appendChild(sm.createInspectorSettingsAccordion('Hires fix.', hiresFixSettingsContent));
                }
                if (hasRefiner) {
                    refinersSettingsContent = sm.createElementWithClassList('div', 'sd-webui-sm-inspector-category-content');
                    refinersSettingsContent.appendChild(createGenerationInspectorParameter("Enabled", getScriptSettingName('refiner', 'Refiner')));
                    refinersSettingsContent.appendChild(createGenerationInspectorParameter("Checkpoint", getScriptSettingName('refiner', 'Checkpoint')));
                    refinersSettingsContent.appendChild(createGenerationInspectorParameter("Switch at", getScriptSettingName('refiner', 'Switch at')));
                    sm.inspector.appendChild(sm.createInspectorSettingsAccordion('Refiner', refinersSettingsContent));
                }
                // Regardless of whether or not we've added Hires fix. or Refiner settings, they shouldn't be added in the xxx2img accordion (if not used, means it was disabled)
                [getRootSettingName('Hires. fix'), getRootSettingName('Upscaler'), getRootSettingName('Hires steps'), getRootSettingName('Denoising strength'),
                    getRootSettingName('Upscale by'), getRootSettingName('Hires checkpoint'), getRootSettingName('Hires sampling method'), getRootSettingName('Hires prompt'),
                    getRootSettingName('Hires negative prompt'), getScriptSettingName('refiner', 'Refiner'), getScriptSettingName('refiner', 'Checkpoint'),
                    getScriptSettingName('refiner', 'Switch at')
                ].forEach(curatedSettingNames.add.bind(curatedSettingNames));
                mergedComponentSettings = savedComponentSettings;
                for (sectionName in mergedComponentSettings) {
                    savedSettingNames = Object.keys(mergedComponentSettings[sectionName]);
                    for (_b = 0, savedSettingNames_1 = savedSettingNames; _b < savedSettingNames_1.length; _b++) {
                        settingName = savedSettingNames_1[_b];
                        value = mergedComponentSettings[sectionName][settingName];
                        settingPath = sectionName.endsWith('.py') ? getScriptSettingName(sectionName.substring(0, sectionName.length - 3), settingName) : "".concat(sectionName, "/").concat(settingName);
                        if (curatedSettingNames.has(settingPath) ||
                            (sm.componentMap.hasOwnProperty(settingPath) && sm.memoryStorage.currentDefault.contents.hasOwnProperty(settingPath) &&
                                areLooselyEqualValue(value, sm.componentMap[settingPath].component.props.value, sm.memoryStorage.currentDefault.contents[settingPath]))) {
                            delete mergedComponentSettings[sectionName][settingName];
                        }
                    }
                }
                // Add saved default value if it differs from the current UI *or* current default values, but not if it's already shown elsewhere (or isn't xxx2img-related)
                for (sectionName in savedComponentDefaults) {
                    mergedComponentSettings[sectionName] = mergedComponentSettings[sectionName] || {};
                    for (settingName in savedComponentDefaults[sectionName]) {
                        settingPath = "".concat(sectionName, "/").concat(settingName);
                        if (curatedSettingNames.has(settingPath) || (settingPath.indexOf("".concat(entry.data.type, "2img")) == -1)) {
                            continue;
                        }
                        // if settingName not in savedComponentSettings,  then 
                        if (!mergedComponentSettings[sectionName].hasOwnProperty(settingName)) {
                            if (!sm.componentMap.hasOwnProperty(settingPath)) { // rogue setting
                                continue;
                            }
                            value = savedComponentDefaults[sectionName][settingName];
                            if (!areLooselyEqualValue(value, sm.componentMap[settingPath].component.props.value, sm.memoryStorage.currentDefault.contents[settingPath])) {
                                mergedComponentSettings[sectionName][settingName] = value;
                            }
                            // if(value != sm.componentMap[settingPath].component.props.value || value != sm.memoryStorage.currentDefault.contents[settingPath]){
                            //     mergedComponentSettings[sectionName][settingName] = value;
                            // }
                        }
                        // mergedComponentSettings[sectionName][settingName] = savedComponentSettings[sectionName][settingName];
                    }
                    if (Object.keys(mergedComponentSettings[sectionName]).length == 0) {
                        delete mergedComponentSettings[sectionName];
                    }
                }
                for (sectionName in mergedComponentSettings) {
                    prettyLabelName = sectionName;
                    prettyLabelName = sectionName.replace(/\.py$/g, '').replaceAll('_', ' ');
                    prettyLabelName = prettyLabelName[0].toUpperCase() + prettyLabelName.slice(1);
                    sectionSettingsContainer = sm.createInspectorSettingsAccordion(prettyLabelName, mergedComponentSettings[sectionName]);
                    // todo: button
                    //
                    sm.inspector.appendChild(sectionSettingsContainer);
                }
                return [2 /*return*/];
            });
        });
    };
    sm.applyQuickParameters = function (values) {
        var filter = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            filter[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                values = (_a = sm.utils).getFilteredObject.apply(_a, __spreadArray([values], filter, false));
                return [2 /*return*/, sm.api.post("quicksettings", { contents: JSON.stringify(values) })
                        .then(function (response) {
                        if (!sm.utils.isValidResponse(response, 'success') || !response.success) {
                            Promise.reject(response);
                            return;
                        }
                        sm.applyComponentSettings(values);
                    })
                        .catch(function (e) { return sm.utils.logResponseError("[State Manager] Applying quicksettings failed with error", e); })];
            });
        });
    };
    // sm.applyGenerationParameters = async function(values: {[path: string]: any}, ...filter: string[]): Promise<void>{
    //     values = sm.utils.getFilteredObject(values, ...filter);
    //     sm.applyComponentSettings(values); 
    // }
    sm.applyComponentSettings = function (settings) {
        for (var _i = 0, _a = Object.keys(settings); _i < _a.length; _i++) {
            var componentPath = _a[_i];
            var componentData = sm.componentMap[componentPath];
            componentData.component.props.value = settings[componentPath];
            componentData.component.instance.$set({ value: componentData.component.props.value });
        }
    };
    sm.createInspectorSettingsAccordion = function (label, data) {
        var accordion = sm.createElementWithClassList('div', 'sd-webui-sm-inspector-category', 'block', 'gradio-accordion');
        accordion.appendChild(sm.createInspectorLabel(label));
        accordion.appendChild(sm.createElementWithInnerTextAndClassList('span', '▼', 'foldout'));
        var content = data;
        if (!(data instanceof HTMLElement)) {
            content = sm.createElementWithClassList('div', 'sd-webui-sm-inspector-category-content');
            var _loop_3 = function (settingPath) {
                content.appendChild(sm.createInspectorParameter(settingPath, data[settingPath], function () {
                    sm.applyGenerationAccordionParameters(label, data, settingPath);
                    // if(data.enabled != accordion.classList.contains('input-accordion-open')){
                    //     accordion.querySelector('.label-wrap').click();
                    // }
                }));
            };
            for (var settingPath in data) {
                _loop_3(settingPath);
            }
        }
        var applyButton = sm.createElementWithInnerTextAndClassList('button', "Load ".concat(label).concat(label.toLowerCase().endsWith('settings') ? '' : ' settings'), 'sd-webui-sm-inspector-wide-button', 'sd-webui-sm-inspector-load-button');
        content.appendChild(applyButton);
        applyButton.addEventListener('click', function () {
            for (var _i = 0, _a = applyButton.parentNode.querySelectorAll('.sd-webui-sm-inspector-param :checked'); _i < _a.length; _i++) {
                var param = _a[_i];
                param.apply();
            }
        });
        content.style.height = '0';
        accordion.appendChild(content);
        accordion.addEventListener('click', function () {
            if (content.style.height == '100%') {
                content.style.height = '0';
                // content.style.display = 'none';
                accordion.classList.remove('open');
            }
            else {
                content.style.height = '100%';
                // content.style.display = 'block';
                accordion.classList.add('open');
            }
        });
        return accordion;
    };
    sm.createInspectorPromptSection = function (label, prompt, onUse) {
        var promptContainer = sm.createElementWithClassList('div', 'prompt-container', 'sd-webui-sm-inspector-param', sm.svelteClasses.prompt);
        promptContainer.apply = onUse;
        var promptField = sm.createElementWithInnerTextAndClassList('textarea', prompt, 'prompt');
        promptField.readOnly = true;
        var promptButtons = sm.createElementWithClassList('div', 'prompt-button-container');
        // const viewPromptButton = sm.createElementWithInnerTextAndClassList('button', '👁');
        // viewPromptButton.title = "View prompt";
        promptButtons.appendChild(sm.createUseButton(onUse));
        promptButtons.appendChild(sm.createCopyButton(prompt));
        // promptButtons.appendChild(viewPromptButton);
        promptContainer.appendChild(sm.createInspectorLabel(label));
        promptContainer.appendChild(promptField);
        promptContainer.appendChild(promptButtons);
        return promptContainer;
    };
    sm.createInspectorParameterSection = function (value, onUse) {
        var paramContainer = sm.createElementWithClassList('div', 'param-container');
        // paramContainer.onUse = onUse;
        var valueString = value === null || value === void 0 ? void 0 : value.toString();
        var valueElement;
        if (valueString === 'true') {
            valueElement = sm.createElementWithInnerTextAndClassList('span', '✓', 'param-value', 'true');
        }
        else if (valueString === 'false') {
            valueElement = sm.createElementWithInnerTextAndClassList('span', '✖', 'param-value', 'false');
        }
        else {
            valueElement = sm.createElementWithInnerTextAndClassList('span', valueString, 'param-value');
        }
        paramContainer.appendChild(valueElement);
        var buttonContainer = sm.createElementWithClassList('div', 'button-container');
        buttonContainer.appendChild(sm.createUseButton(onUse));
        buttonContainer.appendChild(sm.createCopyButton(value));
        paramContainer.appendChild(buttonContainer);
        return paramContainer;
    };
    sm.createUseButton = function (onUse) {
        var button = sm.createElementWithInnerTextAndClassList('button', '↙️', 'sd-webui-sm-apply-button'); //alt 📋, ↙️, 🔖, or 🗳
        button.title = "Apply to prompt (overrides current)";
        button.addEventListener('click', function (e) {
            onUse();
            e.stopPropagation();
        });
        // button.onclick = onUse;
        return button;
    };
    sm.createCopyButton = function (value) {
        var button = sm.createElementWithInnerTextAndClassList('button', '📄'); //alt 📋
        button.title = "Copy to clipboard";
        button.addEventListener('click', function () { return navigator.clipboard.writeText(value.toString()); });
        return button;
    };
    sm.createInspectorLabel = function (label) {
        var labelWithCheckbox = sm.createElementWithClassList('span', 'label-container');
        var checkbox = sm.createElementWithClassList('input', 'param-checkbox', sm.svelteClasses.checkbox);
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        checkbox.addEventListener('click', function (e) { return e.stopPropagation(); });
        labelWithCheckbox.appendChild(checkbox);
        labelWithCheckbox.appendChild(sm.createElementWithInnerTextAndClassList('span', label, 'label'));
        return labelWithCheckbox;
    };
    sm.createInspectorParameter = function (label, value, onUse) {
        var paramContainer = sm.createElementWithClassList('div', 'sd-webui-sm-inspector-param');
        paramContainer.apply = onUse;
        paramContainer.appendChild(sm.createInspectorLabel(label));
        paramContainer.appendChild(sm.createInspectorParameterSection(value, onUse));
        return paramContainer;
    };
    sm.getGalleryPreviews = function () {
        return gradioApp().querySelectorAll('div[id^="tab_"] div[id$="_results"] .thumbnail-item > img');
    };
    sm.getCurrentState = function (type) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = {
                            saveVersion: sm.version,
                            type: type, // txt2img | img2img
                            defaults: sm.memoryStorage.currentDefault.hash
                        };
                        return [4 /*yield*/, sm.getQuickSettings()];
                    case 1: //type = txt2img or img2img
                    return [2 /*return*/, (_a.quickSettings = _b.sent(),
                            // generationSettings: sm.getGenerationSettings(type),
                            // scriptSettings: sm.getScriptsSettings(),
                            // extraSettings: sm.getSettingsFromInputs(Array.from(app.querySelectorAll(`#${type}_settings fieldset, #${type}_settings div`)).filter(e => e.id.startsWith('setting_')).map(e => Array.from(e.querySelectorAll('input'))).flat()),
                            _a.componentSettings = sm.getComponentSettings(type, true),
                            // addedSettings, face rstore, face restore model, tiling
                            _a.preview = sm.createPreviewImageData(),
                            _a)];
                }
            });
        });
    };
    sm.saveState = function (state, group) {
        state.createdAt = Date.now();
        state.groups = [group];
        sm.memoryStorage.entries.data[state.createdAt] = state;
        sm.memoryStorage.entries.updateKeys();
        sm.updateStorage();
    };
    sm.deleteStates = function (requireConfirmation) {
        var stateKeys = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            stateKeys[_i - 1] = arguments[_i];
        }
        if (requireConfirmation && confirm("Delete ".concat(stateKeys.length, " item").concat(stateKeys.length == 1 ? '' : 's', "? This action cannot be undone."))) {
            console.log(stateKeys);
            for (var _a = 0, stateKeys_1 = stateKeys; _a < stateKeys_1.length; _a++) {
                var key = stateKeys_1[_a];
                delete sm.memoryStorage.entries.data[key];
            }
            // console.log(sm.memoryStorage.data.length + " : " + sm.memoryStorage.keys.length);/
            sm.memoryStorage.entries.updateKeys();
            // console.log(sm.memoryStorage.data.length + " : " + sm.memoryStorage.keys.length);
            sm.updateStorage();
            // console.log(sm.memoryStorage.data.length + " : " + sm.memoryStorage.keys.length);
        }
    };
    sm.addStateToGroup = function (stateKey, group) {
        var state = sm.memoryStorage.entries.data[stateKey];
        state.groups = state.groups || [group];
        if (state.groups.indexOf(group) == -1) {
            state.groups.push(group);
        }
        sm.updateStorage();
    };
    sm.removeStateFromGroup = function (stateKey, group) {
        var state = sm.memoryStorage.entries.data[stateKey];
        if (!('groups' in state) || !state.groups) {
            return;
        }
        var groupIndex = state.groups.indexOf(group);
        if (groupIndex > -1) { // It was in this group
            state.groups.splice(groupIndex, 1);
            if (state.groups.length == 0) {
                delete sm.memoryStorage.entries.data[stateKey];
                sm.memoryStorage.entries.updateKeys();
            }
        }
        sm.updateStorage();
    };
    sm.setStateName = function (stateKey, name) {
        sm.memoryStorage.entries.data[stateKey].name = name;
        sm.updateStorage();
    };
    // Not used atm, but might be a more stable alternative down the line
    sm.buildComponentMap = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, sm.api.get("componentids")
                        .then(function (response) {
                        if (!sm.utils.isValidResponse(response)) {
                            Promise.reject(response);
                            return;
                        }
                        sm.componentMap = {};
                        var _loop_4 = function (path) {
                            var component = gradio_config.components.find(function (c) { return c.id == response[path]; });
                            var pathParts = path.split('/');
                            if (pathParts[pathParts.length - 1] != 'value') {
                                return "continue";
                            }
                            var data = {
                                component: component,
                                element: app.getElementById(component.props.elem_id || "component-".concat(component.id))
                            };
                            //Hires. fix
                            // if(pathParts.length == 3 && specialCaseComponents.hasVisibleCheckbox.find(n => n == pathParts[pathParts.length - 2]) != undefined){
                            //     // data.element.id == "txt2img_hr-checkbox" e.g. This is *not* the checkbox we see in the UI, but rather the hidden one.
                            //     const visibleCheckbox = app.getElementById(data.element.id.replace("-checkbox", "-visible-checkbox"));
                            //     // We could use data.element.addEventListener("change", ...) here, but I don't like the idea of adding a "global" listener
                            //     // like that, that extends outside the scope of this extension. Thus, a hacky data.onchange() that we call manually. Neat.
                            //     data.onChange = () => {
                            //         visibleCheckbox.checked = (<HTMLInputElement>data.element).checked;
                            //     };
                            // }
                            sm.componentMap[pathParts.slice(0, pathParts.length - 1).join('/')] = data;
                        };
                        for (var path in response) {
                            _loop_4(path);
                        }
                        // Input accordions extend from gr.Checkbox, where an opened accordion = enabled and closed = disabled
                        // They also contain a separate checkbox to override this behaviour, called `xxx-visible-checkbox`
                        // To make matters worse, the refiner is just called `txt2img_enable`, and doesn't add itself to the monitored components
                        // Since there's no way to retrieve the refiner property path from the accordion, I'm just gonna manually hack those in for now
                        var inputAccordions = document.querySelectorAll('#tab_txt2img .input-accordion, #tab_img2img .input-accordion');
                        var _loop_5 = function (accordion) {
                            var component = gradio_config.components.find(function (c) { return c.props.elem_id == accordion.id; });
                            var checkbox = accordion.parentElement.querySelector("#".concat(accordion.id, "-checkbox"));
                            var visibleCheckbox = accordion.parentElement.querySelector("#".concat(accordion.id, "-visible-checkbox"));
                            if (!checkbox || !visibleCheckbox) {
                                console.warn("[State Manager] An input accordion with an unexpected layout or naming was found (id: ".concat(accordion.id, ")"));
                                return "continue";
                            }
                            // let data = sm.componentMap['txt2img/Hires. fix'];
                            var data = sm.componentMap["".concat(accordion.id.split('_')[0], "/").concat(component.label)];
                            if (!data) {
                                data = {
                                    component: component,
                                    element: checkbox
                                };
                                switch (accordion.id) {
                                    case 'txt2img_enable':
                                        sm.componentMap['customscript/refiner.py/txt2img/Refiner'] = data;
                                        break;
                                    case 'img2img_enable':
                                        sm.componentMap['customscript/refiner.py/img2img/Refiner'] = data;
                                        break;
                                }
                            }
                            // We could use data.element.addEventListener("change", ...) here, but I don't like the idea of adding a "global" listener
                            // like that, that extends outside the scope of this extension. Thus, a hacky data.onchange() that we call manually. Neat.
                            data.onChange = function () {
                                visibleCheckbox.checked = data.element.checked;
                            };
                        };
                        for (var _i = 0, inputAccordions_1 = inputAccordions; _i < inputAccordions_1.length; _i++) {
                            var accordion = inputAccordions_1[_i];
                            _loop_5(accordion);
                        }
                        var settingComponents = gradio_config.components.filter(function (c) { var _a; return (_a = c.props.elem_id) === null || _a === void 0 ? void 0 : _a.startsWith('setting_'); });
                        for (var _a = 0, settingComponents_1 = settingComponents; _a < settingComponents_1.length; _a++) { // {path: id}
                            var component = settingComponents_1[_a];
                            var data = {
                                component: component,
                                element: app.getElementById(component.props.elem_id)
                            };
                            sm.componentMap[component.props.elem_id.substring(8)] = data; // strips "setting_" so we get sm.componentMap['sd_model_checkpoint'] e.g.
                        }
                    })
                        .catch(function (e) { return sm.utils.logResponseError("[State Manager] Getting component IDs failed with error", e); })];
            });
        });
    };
    sm.getFromStorage = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, sm.api.get("savelocation")
                        .then(function (response) {
                        if (!sm.utils.isValidResponse(response, 'location')) {
                            Promise.reject(response);
                            return;
                        }
                        if (response.location == 'File') {
                            return sm.getFileStorage();
                        }
                        else {
                            return sm.getLocalStorage();
                        }
                    })
                        .then(sm.processStorageData)
                        // .then(data => {
                        //     return sm.processStorageData(data);
                        // })
                        .catch(function (e) { return sm.utils.logResponseError("[State Manager] Getting storage failed with error", e); })];
            });
        });
    };
    sm.processStorageData = function (storedData) {
        return __awaiter(this, void 0, void 0, function () {
            var bytes, decompressed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Processing storage data: " + storedData.length);
                        console.log("PROC   " + (typeof storedData) + " - " + sm.utils.isEmptyObject(storedData));
                        if (sm.utils.isEmptyObject(storedData) || storedData == "") {
                            return [2 /*return*/, {
                                    defaults: {},
                                    entries: {}
                                }];
                        }
                        bytes = storedData;
                        if (!(storedData instanceof Uint8Array)) { // Data is in "legacy" SM 1.0 format, which was wrong and wasteful, or stringified response from file through FastAPI
                            bytes = Uint8Array.from(JSON.parse(storedData));
                        }
                        return [4 /*yield*/, sm.utils.decompress(bytes)];
                    case 1:
                        decompressed = _a.sent();
                        console.log("processing 2: " + decompressed.length);
                        console.log("processing 3: " + Object.keys(JSON.parse(decompressed)).length);
                        return [2 /*return*/, JSON.parse(decompressed) || {
                                defaults: {},
                                entries: {}
                            }];
                }
            });
        });
    };
    sm.getLocalStorage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var promise;
            return __generator(this, function (_a) {
                promise = new Promise(function (resolve, _reject) {
                    sm.ldb.get('sd-webui-state-manager-data', function (storedData) {
                        if (storedData == null || storedData == '[]' || storedData == '') {
                            storedData = {};
                        }
                        resolve(storedData);
                    });
                });
                return [2 /*return*/, promise];
            });
        });
    };
    sm.getFileStorage = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, sm.api.get("filedata")
                        .then(function (response) {
                        if (!sm.utils.isValidResponse(response, 'data')) {
                            Promise.reject(response);
                        }
                        else {
                            return response.data || {
                                defaults: {},
                                entries: {}
                            };
                        }
                    })
                        .catch(function (e) { return sm.utils.logResponseError("[State Manager] Getting file storage failed with error", e); })];
            });
        });
    };
    sm.updateStorage = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                sm.api.get("savelocation")
                    .then(function (response) {
                    if (!sm.utils.isValidResponse(response, 'location')) {
                        Promise.reject(response);
                    }
                    else if (response.location == 'File') {
                        sm.updateFileStorage();
                    }
                    else {
                        sm.updateLocalStorage();
                    }
                })
                    .catch(function (e) { return sm.utils.logResponseError("[State Manager] Updating storage failed with error", e); });
                return [2 /*return*/];
            });
        });
    };
    sm.updateLocalStorage = function (compressedData) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(compressedData == undefined)) return [3 /*break*/, 2];
                        return [4 /*yield*/, sm.getCompressedMemoryStorage()];
                    case 1:
                        compressedData = _a.sent();
                        _a.label = 2;
                    case 2:
                        sm.ldb.set('sd-webui-state-manager-data', compressedData);
                        return [2 /*return*/];
                }
            });
        });
    };
    sm.updateFileStorage = function (compressedData) {
        return __awaiter(this, void 0, void 0, function () {
            var payloadStringifiedArray;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(compressedData == undefined)) return [3 /*break*/, 2];
                        return [4 /*yield*/, sm.getCompressedMemoryStorage()];
                    case 1:
                        compressedData = _a.sent();
                        _a.label = 2;
                    case 2:
                        payloadStringifiedArray = JSON.stringify(Array.from(compressedData));
                        return [2 /*return*/, sm.api.post("save", { contents: payloadStringifiedArray.substring(1, payloadStringifiedArray.length - 1) })
                                .catch(function (e) { return sm.utils.logResponseError("[State Manager] Saving to file storage failed with error", e); })];
                }
            });
        });
    };
    sm.getCompressedMemoryStorage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var compressed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, sm.utils.compress(JSON.stringify({
                            defaults: sm.memoryStorage.savedDefaults,
                            entries: sm.memoryStorage.entries.data
                        }))];
                    case 1:
                        compressed = _a.sent();
                        // return JSON.stringify(Array.from(compressed));
                        return [2 /*return*/, compressed];
                }
            });
        });
    };
    sm.initMemoryStorage = function (storedData) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('INITTTTTTTT');
                sm.memoryStorage = {
                    currentDefault: null,
                    savedDefaults: storedData.defaults || {},
                    entries: {
                        data: storedData.entries || {},
                        keys: [],
                        updateKeys: function () {
                            sm.memoryStorage.entries.keys = Object.keys(sm.memoryStorage.entries.data);
                            sm.memoryStorage.entries.keys.sort().reverse();
                        }
                    }
                };
                // sm.memoryStorage = {
                //     data: storedData,
                //     keys: null,
                //     updateKeys: function(){
                //         sm.memoryStorage.keys = Object.keys(sm.memoryStorage.data);
                //         sm.memoryStorage.keys.sort().reverse();
                //     }
                // };
                console.log('INIT 2!!');
                sm.memoryStorage.entries.updateKeys(); //.entries
                // Load default UI settings
                // sm.inspector.innerHTML = "Loading current UI defaults...";
                return [2 /*return*/, sm.api.get("uidefaults")
                        .then(function (response) {
                        if (!sm.utils.isValidResponse(response, 'hash', 'contents')) {
                            Promise.reject(response);
                            return;
                        }
                        var contents = {};
                        // console.warn(typeof response.contents);
                        // console.log(response.contents);
                        for (var _i = 0, _a = Object.keys(response.contents); _i < _a.length; _i++) {
                            var path = _a[_i];
                            var pathParts = path.split('/');
                            if (pathParts[pathParts.length - 1] != 'value') {
                                continue; // Skip other settings like min/max if they sneak in here
                            }
                            contents[pathParts.slice(0, pathParts.length - 1).join('/')] = response.contents[path];
                        }
                        var currentDefault = {
                            hash: response.hash,
                            contents: contents
                        };
                        sm.memoryStorage.currentDefault = currentDefault;
                        sm.memoryStorage.savedDefaults[currentDefault.hash] = contents;
                        // sm.inspector.innerHTML = "";
                        console.log('INIT 3!!');
                        // sm.updateInspector();
                    })
                        .catch(function (e) {
                        // sm.inspector.innerHTML = "There was an error loading current UI defaults. Please reload the UI (refresh the page).";
                        sm.utils.logResponseError("[State Manager] Getting UI defaults failed with error", e);
                    })];
            });
        });
    };
    sm.syncStorage = function (direction, type) {
        return sm.api.get("savelocation")
            .then(function (response) {
            if (!sm.utils.isValidResponse(response, 'saveFile')) {
                Promise.reject(response);
                return;
            }
            var sources = ["this browser's Indexed DB", "the shared ".concat(response.saveFile, " file")];
            var warning = type == 'merge' ?
                "merge the entries of both ".concat(sources[0], " and ").concat(sources[1], ", and write the result to ").concat(direction == 'idb2file' ? "this file" : "the Indexed DB") :
                "override the entries of ".concat(sources[direction == 'idb2file' ? 1 : 0], " with the contents of ").concat(sources[direction == 'idb2file' ? 0 : 1]);
            if (!confirm("You are about to ".concat(warning, ". This operation can not be undone! Are you sure you wish to continue?"))) {
                return;
            }
            (direction == 'idb2file' ? sm.getLocalStorage() : sm.getFileStorage())
                .then(function (d) {
                console.log("f0: " + d.length);
                return sm.processStorageData(d);
            })
                .then(function (sourceData) {
                console.log("f1: " + sourceData);
                if (type == 'overwrite') {
                    return sourceData;
                }
                else {
                    (direction == 'idb2file' ? sm.getFileStorage() : sm.getLocalStorage())
                        .then(sm.processStorageData)
                        .then(function (destinationData) {
                        Object.assign(destinationData, sourceData);
                        return destinationData;
                    })
                        .catch(function (e) { return sm.utils.logResponseError("[State Manager] Could not merge data", e); });
                }
            })
                .then(function (destinationData) {
                console.log("f2: " + destinationData);
                return sm.utils.compress(JSON.stringify(destinationData));
            })
                .then(function (compressedDestinationData) {
                console.log("f3: ".concat((typeof compressedDestinationData), "  (").concat(compressedDestinationData instanceof Uint8Array, ")"));
                if (direction == 'idb2file') {
                    sm.updateFileStorage(compressedDestinationData);
                }
                else {
                    sm.updateLocalStorage(compressedDestinationData);
                }
            })
                .catch(function (e) { return sm.utils.logResponseError("[State Manager] Could not sync data", e); });
        })
            .catch(function (e) { return sm.utils.logResponseError("[State Manager] Getting save file name failed with error", e); });
    };
    sm.getStateData = function (group) {
        var _a, _b;
        var result = []; //todo: entry[]
        for (var _i = 0, _c = sm.memoryStorage.entries.keys; _i < _c.length; _i++) {
            var key = _c[_i];
            var data = sm.memoryStorage.entries.data[key];
            if (!group || group == 'all' || (((_b = (_a = data.groups) === null || _a === void 0 ? void 0 : _a.indexOf(group)) !== null && _b !== void 0 ? _b : -1) > -1)) {
                // data.createdAt = key;
                result.push(data);
            }
        }
        return result;
    };
    sm.clearHistory = function () {
        if (!confirm("Warning! You are about to delete all entries that are not favourited and do not have a name. This operation can not be undone! Are you sure you wish to continue?")) {
            return;
        }
        for (var _i = 0, _a = sm.memoryStorage.entries.keys; _i < _a.length; _i++) {
            var key = _a[_i];
            var data = sm.memoryStorage.entries.data[key];
            if (!data.groups || (data.groups.length == 1 && data.groups[0] == 'history' && (!data.hasOwnProperty('name') || data.name == ''))) {
                delete sm.memoryStorage.entries.data[key];
            }
        }
        sm.memoryStorage.entries.updateKeys();
        sm.updateStorage();
    };
    sm.clearData = function (location) {
        sm.api.get("savelocation")
            .then(function (response) {
            if (!sm.utils.isValidResponse(response, 'location', 'saveFile')) {
                Promise.reject(response);
                return;
            }
            var sources = ["this browser's Indexed DB", "the shared ".concat(response.saveFile, " file")];
            if (!confirm("Warning! You are about to delete ALL entries from ".concat(sources[location == 'Browser\'s Indexed DB' ? 0 : 1], ". This operation can not be undone! Are you sure you wish to continue?"))) {
                return;
            }
            function ensureMemoryStorageIsSynced() {
                if (response.location == location) {
                    sm.initMemoryStorage({});
                    sm.updateEntries();
                }
            }
            if (location == 'File') {
                sm.updateFileStorage([])
                    .then(function () {
                    console.log("[State Manager] Succesfully deleted all File entries");
                    sm.api.post("showmodal", { type: 'info', contents: "".concat(response.saveFile, " has been cleared") });
                    ensureMemoryStorageIsSynced();
                })
                    .catch(function (e) { return sm.utils.logResponseError("[State Manager] Clearing File entries failed with error", e); });
            }
            else {
                sm.updateLocalStorage([]);
                console.log("[State Manager] Succesfully deleted all IDB entries");
                sm.api.post("showmodal", { type: 'info', contents: "IDB has been cleared" });
                ensureMemoryStorageIsSynced();
            }
        })
            .catch(function (e) { return sm.utils.logResponseError("[State Manager] Getting save file name failed with error", e); });
    };
    // sm.applyAll = function(data){
    //     let generationParams = Object.keys(data.generationSettings);
    //     delete generationParams.accordions;
    //     sm.applyQuickParameters(data.quickSettings, ...Object.keys(data.quickSettings));
    //     sm.applyGenerationParameters(data.type, data.generationSettings, ...generationParams);
    //     for(const scriptName in data.scriptSettings){
    //         const scriptSettings = data.scriptSettings[scriptName];
    //         sm.applyScriptParameters(scriptName, scriptSettings, ...Object.keys(scriptSettings));
    //     }
    //     const accordionLabels = Array.from(app.querySelectorAll('#txt2img_accordions .input-accordion .label-wrap'));
    //     for(const accordionName in data.generationSettings.accordions){
    //         const label = accordionLabels.find(l => l.innerText.startsWith(accordionName));
    //         if(!label){
    //             console.log(`Could not apply settings for gen. accordion '${accordionName}'; no accordion UI found`);
    //             continue;
    //         }
    //         if(data.generationSettings.accordions[accordionName].enabled != label.parentNode.classList.contains('input-accordion-open')){
    //             label.click();
    //         }
    //     }
    // }
    // sm.applyQuickParameters = function(data, ...params){
    //     const quickSettingsContainer = app.querySelector('#quicksettings');
    //     const inputs = Array.from(quickSettingsContainer.querySelectorAll('input'));
    //     sm.tryApplyingParams(inputs, data, ...params);
    // }
    // sm.applyGenerationParameters = function(type, data, ...params){
    //     const selectors = type == 'txt2img' ? txt2imgGenerationSettingSelectors : img2imgGenerationSettingSelectors;
    //     for(const param of params) {
    //         const input = app.querySelector(selectors[param]);
    //         if(!input){
    //             console.warn(`Could not set generation param ${param}; no matching input found`);
    //             return;
    //         }
    //         sm.setInputValue(input, data[param]);
    //     }
    // }
    // sm.applyGenerationAccordionParameters = function(name, data, ...params){
    //     const containerLabel = Array.from(app.querySelectorAll("#txt2img_accordions .label-wrap span")).find(el => el.innerText.startsWith(`${name}`));
    //     if(!containerLabel){
    //         console.warn(`Could not set param for gen. accordion '${name}'; no matching UI accordion found`);
    //         return;
    //     }
    //     const container = containerLabel.parentNode.parentNode;
    //     const inputs = Array.from(container.querySelectorAll("input"));
    //     let prunedParams = params;
    //     delete prunedParams.enabled; // Not a real param
    //     sm.tryApplyingParams(inputs, data, ...prunedParams);
    // }
    // sm.applyScriptParameters = function(scriptName, data, ...params){
    //     const containerLabel = Array.from(app.querySelectorAll("#txt2img_script_container .label-wrap span")).find(el => el.innerText.startsWith(`${scriptName}`));
    //     if(!containerLabel){
    //         console.warn(`Could not set param for script ${scriptName}; no matching script section found`);
    //         return;
    //     }
    //     const container = containerLabel.parentNode;
    //     const inputs = Array.from(container.querySelectorAll("input"));
    //     sm.tryApplyingParams(inputs, data, ...params);
    // }
    sm.applyAll = function (state) {
        alert('gotta impl');
        console.log(JSON.stringify(state));
    };
    // sm.tryApplyingParams = function(inputs, data, ...params){
    //     // let inputLabelMap = {};
    //     let inputLabels = [];
    //     for(const input of inputs){
    //         // inputLabelMap[input] = sm.getLabelFromInput(input);
    //         inputLabels.push(sm.getLabelFromInput(input));
    //     }
    //     for(const param of params) {
    //         const input = inputLabels.find(l => l?.innerText == param)?.parentNode.parentNode.querySelector('input');
    //         if(!input){
    //             console.warn(`Could not apply param ${param}; no matching input found`);
    //             return;
    //         }
    //         sm.setInputValue(input, data[param]);
    //     }
    // }
    // sm.setInputValue = function(input, value){
    //     if(input.type == 'checkbox' || input.type == 'radio'){
    //         input.checked = value;
    //     }
    //     else{
    //         // Handle dropdown special case
    //         if(input.type == 'text' && sm.getDropdownRoot(input)){
    //             sm.setDropdownValue(input, value);
    //         }
    //         input.value = value;
    //     }
    //     // Some inputs do not update simply on `change`
    //     input.dispatchEvent(new Event('input'));
    //     input.dispatchEvent(new Event('keydown'));
    //     input.dispatchEvent(new Event('change'));
    //     // input.dispatchEvent(new Event('blur'));
    // }
    // sm.getDropdownRoot = function(element){
    //     let parent = element;
    //     for(let i = 0; i < 7; i++){ // should be 5, but +2 just in case
    //         parent = parent.parentNode;
    //         if(parent.classList.contains('gradio-dropdown')){
    //             return parent;
    //         }
    //     }
    //     return null;
    // }
    // // Hey Gradio, could we have like, a normal way of selecting a value, pretty please? sheesh...
    // sm.setDropdownValue = async function(input, value){
    //     input.dispatchEvent(new Event('focus'));
    //     input.value = value;
    //     await new Promise(r => setTimeout(r, 1));
    //     input.dispatchEvent(new Event('input'));
    //     input.dispatchEvent(new Event('change'));
    //     await new Promise(r => setTimeout(r, 1));
    //     const keyDownEvent = new Event('keydown')
    //     keyDownEvent.key = 'Enter'
    //     input.dispatchEvent(keyDownEvent);
    // }
    sm.getQuickSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, sm.api.get("quicksettings")
                        .then(function (response) {
                        if (!sm.utils.isValidResponse(response, 'settings')) {
                            Promise.reject(response);
                        }
                        return response.settings;
                    })
                        .catch(function (e) { return sm.utils.logResponseError("[State Manager] Getting State Manager version failed with error", e); })];
            });
        });
    };
    sm.getComponentSettings = function (type, changedOnly) {
        if (changedOnly === void 0) { changedOnly = true; }
        var settings = {};
        // let noComponentFoundSettings: string[] = [];
        for (var _i = 0, _a = Object.keys(sm.memoryStorage.currentDefault.contents); _i < _a.length; _i++) {
            var componentPath = _a[_i];
            // console.log("---" + componentPath);
            // console.log(sm.componentMap);
            var componentData = sm.componentMap[componentPath];
            if (!componentData) {
                // noComponentFoundSettings.push(componentPath);
                continue;
            }
            var currentValue = componentData.component.props.value;
            var reType = new RegExp("(^|/)".concat(type, "/"));
            if (reType.test(componentPath) && (!changedOnly || sm.memoryStorage.currentDefault.contents[componentPath] != currentValue)) {
                settings[componentPath] = currentValue;
            }
        }
        // if(noComponentFoundSettings.length > 0){
        //     console.warn(`[State Manager] No matching component could be found for the following settings: ${noComponentFoundSettings.join(', ')}`);
        // }
        return settings;
    };
    // sm.getQuickSettings = function(){
    //     let settings = sm.getSettingsFromContainer(app.querySelector('#quicksettings'));
    //     // Add checkpoint, VAE, and hypernetwork manually due to different ui structure
    //     // settings.checkpoint = app.querySelector('#setting_sd_model_checkpoint input').value;
    //     // const vaeInput = app.querySelector('#setting_sd_vae input');
    //     // if(vaeInput){
    //     //     settings.model = vaeInput.value;
    //     // }
    //     // const hyperNetworkInput = app.querySelector('#setting_sd_hypernetwork input');
    //     // if(hyperNetworkInput){
    //     //     settings.model = hyperNetworkInput.value;
    //     // }
    //     return settings;
    // }
    // sm.getGenerationSettings = function(type){
    //     const selectors = type == 'txt2img' ? txt2imgGenerationSettingSelectors : img2imgGenerationSettingSelectors;
    //     let settings = {};
    //     for(let key in selectors){
    //         settings[key] = sm.getInputValue(app.querySelector(selectors[key]));
    //     }
    //     settings.accordions = {};
    //     const accordions = app.querySelectorAll('#txt2img_accordions .input-accordion');
    //     for(const accordion of accordions){
    //         let accordionSettings = sm.getSettingsFromContainer(accordion);
    //         accordionSettings.enabled = accordion.classList.contains('input-accordion-open');
    //         settings.accordions[accordion.querySelector('span').innerText] = accordionSettings;
    //     }
    //     return settings;
    // }
    // // This is super hacky, but there doesn't seem to be a way to access all extensions + their current settings nicely? At least from JS
    // sm.getScriptsSettings = function(){
    //     let scriptSettings = {};
    //     for(const scriptLabel of app.querySelectorAll("#txt2img_script_container .label-wrap")){
    //         // let settings = {};
    //         // for(const input of scriptLabel.parentNode.querySelectorAll("input")){
    //         //     const label = input.parentNode.querySelector('span');
    //         //     if(!label || !label.innerText){
    //         //         continue;
    //         //     }
    //         //     settings[label.innerText] = sm.getInputValue(input);
    //         // }
    //         // scriptSettings[scriptLabel.childNodes[0].innerText] = settings;
    //         scriptSettings[scriptLabel.childNodes[0].innerText] = sm.getSettingsFromContainer(scriptLabel.parentNode);
    //     }
    //     return scriptSettings;
    // }
    // sm.getSettingsFromContainer = function(container){        
    //     return sm.getSettingsFromInputs(container.querySelectorAll("input"));
    // }
    // sm.getSettingsFromInputs = function(inputs){
    //     if(!Array.isArray(inputs)){ // Can be a NodeList
    //         inputs = Array.from(inputs);
    //     }
    //     let settings = {};
    //     for(const input of inputs){
    //         if(serializeInputTypes.indexOf(input.type) == -1){
    //             continue;
    //         }
    //         let label = input.parentNode.querySelector('span');
    //         if(!label || !label.innerText){
    //             if(input.type == 'text'){
    //                 const dropdownRoot = sm.getDropdownRoot(input);
    //                 if(dropdownRoot){
    //                     label = dropdownRoot.querySelector("span");
    //                 }
    //             }
    //             if(!label || !label.innerText){
    //                 continue;
    //             }
    //         }
    //         settings[label.innerText] = sm.getInputValue(input);
    //     }
    //     return settings;
    // }
    // sm.getLabelFromInput = function(input){
    //     let label = input.parentNode.querySelector('span');
    //     if((!label || !label.innerText) && input.type == 'text'){ // We might be a dropdown
    //         label = input.parentNode.parentNode.parentNode.parentNode.parentNode.querySelector("span");
    //         // if(!label || !label.innerText){
    //         //     return null;
    //         // }
    //     }
    //     return label;
    // }
    sm.createPreviewImageData = function () {
        if (!sm.lastHeadImage) {
            return null;
        }
        var galleryPreviews = sm.getGalleryPreviews();
        var image = (galleryPreviews.length > 1 && galleryPreviews[0].src.includes("grids/")) ? galleryPreviews[1] : galleryPreviews[0];
        if (!image) {
            return null;
        }
        // const imageSize = {x: 100, y: 100};
        var scale = 100 / Math.max(image.naturalWidth, image.naturalHeight);
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        // Set width and height
        canvas.width = image.naturalWidth * scale;
        canvas.height = image.naturalHeight * scale;
        // Draw image and export to a data-uri
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        var dataURI = canvas.toDataURL();
        return dataURI;
    };
    sm.createElementWithClassList = function (tagName) {
        var classes = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            classes[_i - 1] = arguments[_i];
        }
        var element = document.createElement(tagName);
        for (var _a = 0, classes_1 = classes; _a < classes_1.length; _a++) {
            var className = classes_1[_a];
            element.classList.add(className);
        }
        return element;
    };
    sm.createElementWithInnerTextAndClassList = function (tagName, innerText) {
        var classes = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            classes[_i - 2] = arguments[_i];
        }
        var element = sm.createElementWithClassList.apply(sm, __spreadArray([tagName], classes, false));
        element.innerText = innerText;
        return element;
    };
    // sm.getInputValue = function(input){
    //     if(!input){
    //         return undefined;
    //     }
    //     return (input.type == 'checkbox' || input.type == 'radio') ? input.checked : input.value;
    // }
    // Stolen from `notification.js`, but can't use same `headImg`. Really wish webui had more callbacks
    sm.checkHeadImage = function () {
        var _a;
        var galleryPreviews = sm.getGalleryPreviews();
        if (galleryPreviews == null)
            return;
        var headImage = (_a = galleryPreviews[0]) === null || _a === void 0 ? void 0 : _a.src;
        if (headImage == null || headImage == sm.lastHeadImage)
            return;
        sm.lastHeadImage = headImage;
        // const imgs = new Set(Array.from(galleryPreviews).map(img => img.src));
        if (sm.autoSaveHistory) {
            sm.saveLastUsedState();
        }
    };
    sm.saveLastUsedState = function () {
        sm.lastUsedState.preview = sm.createPreviewImageData();
        var seedPath = 'customscript/seed.py/txt2img/Seed';
        if (!sm.lastUsedState.componentSettings.hasOwnProperty(seedPath) || sm.lastUsedState.componentSettings[seedPath] == -1) { // Try and grab the actual seed used
            // if(sm.lastUsedState.generationSettings.seed == '-1'){ // Try and grab the actual seed used //todo: REIMPLEMENT THIS
            var seedFromHTMLInfo = Number(app.querySelector('#html_info_txt2img p').innerText.match(/Seed: (\d+)/)[1]); //todo: OR IMG2IMG
            var selectedThumbnail = app.querySelector('#txt2img_gallery .thumbnail-item.selected');
            // If we've got thumbnail i selected, then 0 = grid (seed N), 1 = first image (seed N), 2 = second image (seed N+1), ...
            if (selectedThumbnail != undefined) {
                var thumbnailIndex = Array.prototype.indexOf.call(selectedThumbnail.parentNode.children, selectedThumbnail); //todo: this.getGallerySelectedIndex()?
                seedFromHTMLInfo -= Math.max(thumbnailIndex - 1, 0);
            }
            // sm.lastUsedState.generationSettings.seed = seedFromHTMLInfo;
            sm.lastUsedState.componentSettings[seedPath] = seedFromHTMLInfo;
        }
        // console.log("------------------");
        // console.log(JSON.stringify(sm.lastUsedState));
        sm.saveState(sm.lastUsedState, 'history');
        sm.updateEntries(); // TODO: if we're on history tab
    };
    sm.api = {
        get: function (endpoint) {
            return fetch("".concat(gradio_config.root, "/statemanager/").concat(endpoint)).then(function (response) {
                if (response.ok) {
                    return response.json();
                }
                else {
                    return Promise.reject(response);
                }
            });
        },
        post: function (endpoint, payload) {
            return fetch("".concat(gradio_config.root, "/statemanager/").concat(endpoint), { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': "application/json" }, body: JSON.stringify(payload) })
                .then(function (response) {
                if (response.ok) {
                    return response.json();
                }
                else {
                    return Promise.reject(response);
                }
            });
        }
    };
    // Shamelessly yoinked from https://www.syncfusion.com/blogs/post/deep-compare-javascript-objects.aspx
    sm.utils = {
        isDeepEqual: function (object1, object2) {
            var objKeys1 = Object.keys(object1);
            var objKeys2 = Object.keys(object2);
            if (objKeys1.length !== objKeys2.length)
                return false;
            for (var _i = 0, objKeys1_1 = objKeys1; _i < objKeys1_1.length; _i++) {
                var key = objKeys1_1[_i];
                var value1 = object1[key];
                var value2 = object2[key];
                var isObjects = sm.utils.isObject(value1) && sm.utils.isObject(value2);
                if ((isObjects && !sm.utils.isDeepEqual(value1, value2)) || (!isObjects && value1 !== value2)) {
                    return false;
                }
            }
            return true;
        },
        isObject: function (object) {
            return object != null && typeof object === "object";
        },
        isEmptyObject: function (object) {
            return sm.utils.isObject(object) && Object.keys(object).length == 0;
        },
        isValidResponse: function (response) {
            var requiredProperties = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                requiredProperties[_i - 1] = arguments[_i];
            }
            return response && !sm.utils.isEmptyObject(response) && requiredProperties.every(function (p) { return response.hasOwnProperty(p); });
        },
        logResponseError: function (baseMessage, e) {
            return __awaiter(this, void 0, void 0, function () {
                var err, errType;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            err = "[No error received]";
                            errType = "unknown type";
                            if (!(typeof e == 'string')) return [3 /*break*/, 1];
                            errType = "string";
                            err = e;
                            return [3 /*break*/, 4];
                        case 1:
                            if (!(e instanceof Response)) return [3 /*break*/, 3];
                            // const reader = e.body.getReader({ mode: "byob" });
                            errType = "Response object";
                            return [4 /*yield*/, e.text()];
                        case 2:
                            err = _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            // err = JSON.stringify(e);
                            err = e;
                            _a.label = 4;
                        case 4:
                            console.error("".concat(baseMessage, ": (").concat(errType, " error) ").concat(err));
                            return [2 /*return*/];
                    }
                });
            });
        },
        unflattenSettingsMap: function (settings) {
            var settingPaths = Object.keys(settings);
            var settingsMap = {};
            for (var _i = 0, settingPaths_1 = settingPaths; _i < settingPaths_1.length; _i++) {
                var path = settingPaths_1[_i];
                var pathParts = path.split('/');
                if (pathParts[0] == 'customscript') { // customscript/seed.py/txt2img/Seed/value e.g.
                    settingsMap[pathParts[1]] = settingsMap[pathParts[1]] || {};
                    settingsMap[pathParts[1]][pathParts[3]] = settings[path];
                }
                else { // txt2img/prompt e.g.
                    settingsMap[pathParts[0]] = settingsMap[pathParts[0]] || {};
                    settingsMap[pathParts[0]][pathParts[1]] = settings[path];
                }
            }
            // for(const path of settingPaths){
            //     const pathParts = path.split('/');
            //     let currentHead = settingsMap;
            //     for(let i = 0; i < pathParts.length - 1; i++){
            //         currentHead = currentHead[pathParts[i]] = currentHead[pathParts[i]] || {};
            //     }
            //     currentHead[pathParts[pathParts.length-1]] = settings[path];
            // }
            return settingsMap;
        },
        getFilteredObject: function (values) {
            var filter = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                filter[_i - 1] = arguments[_i];
            }
            if (filter.length > 0) {
                values = Object.keys(values).reduce(function (newValues, path) {
                    if (filter.indexOf(path) > -1) {
                        newValues[path] = values[path];
                    }
                    return newValues;
                }, {});
            }
            return values;
        },
        // https://evanhahn.com/javascript-compression-streams-api-with-strings/
        compress: function (str) {
            return __awaiter(this, void 0, void 0, function () {
                var stream, compressedStream, chunks, reader;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            stream = new Blob([str]).stream();
                            compressedStream = stream.pipeThrough(new CompressionStream("gzip"));
                            chunks = [];
                            reader = compressedStream.getReader();
                            return [4 /*yield*/, reader.read().then(function processChunk(_a) {
                                    var done = _a.done, value = _a.value;
                                    if (done) {
                                        return;
                                    }
                                    chunks.push(value);
                                    return reader.read().then(processChunk);
                                })];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, sm.utils.concatUint8Arrays(chunks)];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        },
        decompress: function (compressedBytes) {
            return __awaiter(this, void 0, void 0, function () {
                var stream, decompressedStream, chunks, reader, stringBytes;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            stream = new Blob([compressedBytes]).stream();
                            decompressedStream = stream.pipeThrough(new DecompressionStream("gzip"));
                            chunks = [];
                            reader = decompressedStream.getReader();
                            return [4 /*yield*/, reader.read().then(function processChunk(_a) {
                                    var done = _a.done, value = _a.value;
                                    if (done) {
                                        return;
                                    }
                                    chunks.push(value);
                                    return reader.read().then(processChunk);
                                })];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, sm.utils.concatUint8Arrays(chunks)];
                        case 2:
                            stringBytes = _a.sent();
                            return [2 /*return*/, new TextDecoder().decode(stringBytes)];
                    }
                });
            });
        },
        concatUint8Arrays: function (uint8arrays) {
            return __awaiter(this, void 0, void 0, function () {
                var blob, buffer;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            blob = new Blob(uint8arrays);
                            return [4 /*yield*/, blob.arrayBuffer()];
                        case 1:
                            buffer = _a.sent();
                            return [2 /*return*/, new Uint8Array(buffer)];
                    }
                });
            });
        }
    };
    sm.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, sm.api.get("version")
                            .then(function (response) {
                            if (!sm.utils.isValidResponse(response, 'version')) {
                                Promise.reject(response);
                            }
                            sm.version = response.version;
                        })
                            .catch(function (e) { return sm.utils.logResponseError("[State Manager] Getting State Manager version failed with error", e); })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, sm.getFromStorage()
                                .then(function (storedData) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, sm.initMemoryStorage(storedData)];
                                        case 1:
                                            _a.sent();
                                            if (sm.hasOwnProperty('updateEntriesWhenStorageReady')) {
                                                sm.updateEntries();
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            }); })
                                .catch(function (e) { return sm.utils.logResponseError("[State Manager] Could not get data from storage", e); })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, sm.buildComponentMap()];
                    case 3:
                        _a.sent();
                        sm.injectUI();
                        return [2 /*return*/];
                }
            });
        });
    };
    onUiLoaded(sm.init);
    onAfterUiUpdate(sm.checkHeadImage);
})(window.stateManager = window.stateManager || {
    componentMap: {},
    memoryStorage: {
        currentDefault: null,
        savedDefaults: null,
        entries: {
            data: {},
            keys: [],
            updateKeys: function () { }
        }
    },
    selection: {
        rangeSelectStart: null,
        entries: [],
        undoableRangeSelectionAmount: 0,
        select: function (entry, type) {
            switch (type) {
                case 'single':
                    for (var _i = 0, _a = this.entries; _i < _a.length; _i++) {
                        var e = _a[_i];
                        e.classList.remove('active');
                    }
                    this.rangeSelectStart = entry;
                    this.entries = [entry];
                    this.undoableRangeSelectionAmount = 0;
                    entry.classList.add('active');
                    break;
                case 'add':
                    this.rangeSelectStart = entry;
                    this.undoableRangeSelectionAmount = 0;
                    entry.classList.toggle('active');
                    if (entry.classList.contains('active')) {
                        this.entries.push(entry);
                    }
                    else {
                        this.entries.splice(this.entries.indexOf(entry), 1);
                    }
                    break;
                case 'range':
                    if (this.rangeSelectStart == null) {
                        this.select(entry, 'single');
                        return;
                    }
                    // unselect previous range select
                    var unselectedEntries = this.entries.splice(this.entries.length - this.undoableRangeSelectionAmount, this.undoableRangeSelectionAmount);
                    for (var i = 0; i < unselectedEntries.length; i++) {
                        unselectedEntries[i].classList.remove('active');
                    }
                    if (entry == this.rangeSelectStart) {
                        return;
                    }
                    // select new range
                    var rangeStartIndex = Array.prototype.indexOf.call(this.rangeSelectStart.parentNode.children, this.rangeSelectStart);
                    var rangeEndIndex = Array.prototype.indexOf.call(entry.parentNode.children, entry);
                    function selectEntry(index) {
                        var rangeEntry = entry.parentNode.childNodes[index];
                        this.entries.push(rangeEntry);
                        rangeEntry.classList.add('active');
                    }
                    if (rangeStartIndex < rangeEndIndex) {
                        for (var i = rangeStartIndex + 1; i <= rangeEndIndex; i++) {
                            selectEntry(i);
                        }
                        this.undoableRangeSelectionAmount = rangeEndIndex - rangeStartIndex; // - 1;    
                    }
                    else {
                        for (var i = rangeStartIndex - 1; i >= rangeEndIndex; i--) {
                            selectEntry(i);
                        }
                        this.undoableRangeSelectionAmount = rangeStartIndex - rangeEndIndex; // - 1;    
                    }
                    break;
            }
            window.stateManager.updateInspector();
        }
    }
});
// })(window.stateManager = window.stateManager || {
//     componentMap: {},
//     memoryStorage: undefined
// });
