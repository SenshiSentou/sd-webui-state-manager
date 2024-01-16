(function(sm){
    // https://github.com/DVLP/localStorageDB - Allows use of indexedDB with a simple localStorage-like wrapper
    !function(){var s,c,e="undefined"!=typeof window?window:{},t=e.indexedDB||e.mozIndexedDB||e.webkitIndexedDB||e.msIndexedDB;"undefined"==typeof window||t?((t=t.open("ldb",1)).onsuccess=function(e){s=this.result},t.onerror=function(e){console.error("indexedDB request error"),console.log(e)},t={get:(c={ready:!(t.onupgradeneeded=function(e){s=null,e.target.result.createObjectStore("s",{keyPath:"k"}).transaction.oncomplete=function(e){s=e.target.db}}),get:function(e,t){s?s.transaction("s").objectStore("s").get(e).onsuccess=function(e){e=e.target.result&&e.target.result.v||null;t(e)}:setTimeout(function(){c.get(e,t)},50)},set:function(t,n,o){if(s){let e=s.transaction("s","readwrite");e.oncomplete=function(e){"Function"==={}.toString.call(o).slice(8,-1)&&o()},e.objectStore("s").put({k:t,v:n}),e.commit()}else setTimeout(function(){c.set(t,n,o)},50)},delete:function(e,t){s?s.transaction("s","readwrite").objectStore("s").delete(e).onsuccess=function(e){t&&t()}:setTimeout(function(){c.delete(e,t)},50)},list:function(t){s?s.transaction("s").objectStore("s").getAllKeys().onsuccess=function(e){e=e.target.result||null;t(e)}:setTimeout(function(){c.list(t)},50)},getAll:function(t){s?s.transaction("s").objectStore("s").getAll().onsuccess=function(e){e=e.target.result||null;t(e)}:setTimeout(function(){c.getAll(t)},50)},clear:function(t){s?s.transaction("s","readwrite").objectStore("s").clear().onsuccess=function(e){t&&t()}:setTimeout(function(){c.clear(t)},50)}}).get,set:c.set,delete:c.delete,list:c.list,getAll:c.getAll,clear:c.clear},sm.ldb=t,"undefined"!=typeof module&&(module.exports=t)):console.error("indexDB not supported")}();

    const txt2imgGenerationSettingSelectors = {
        prompt: '#txt2img_prompt textarea',
        negativePrompt: '#txt2img_neg_prompt textarea',
        sampler: '#txt2img_sampling input',
        steps: '#txt2img_steps input',
        width: '#txt2img_width input',
        height: '#txt2img_height input',
        batchCount: '#txt2img_batch_count input',
        batchSize: '#txt2img_batch_size input',
        cfg: '#txt2img_cfg_scale input',
        seed: '#txt2img_seed input',
        showSubseed: '#txt2img_subseed_show input',
        subseed: '#txt2img_subseed input',
        subseedStrength: '#txt2img_subseed_strength input',
        resizeSeedFromWidth: '#txt2img_seed_resize_from_w input',
        resizeSeedFromHeight: '#txt2img_seed_resize_from_h input',
    };

    // img2img is just all the same params with different prefix + scale and denoise strength
    const img2imgGenerationSettingSelectors = Object.assign({
        scale: '#img2img_scale input',
        denoisingStrength: '#img2img_denoising_strength input'
    }, txt2imgGenerationSettingSelectors);

    for(let option in img2imgGenerationSettingSelectors){
        img2imgGenerationSettingSelectors[option] = img2imgGenerationSettingSelectors[option].replace('txt2img', 'img2img');
    }

    const app = gradioApp();
    
    const serializeInputTypes = ['text', 'number', 'range', 'checkbox', 'radio', 'dropdown'];//, 'fieldset'];
    // const maxEntriesPerPage = 80;
    const maxEntriesPerPage = {
        docked: 80,
        modal: 400
    };
    
    let entryEventListenerAbortController = new AbortController();

    // sm.initStorage();
    
    sm.autoSaveHistory = true;
    sm.lastHeadImage = null;
    sm.lastUsedState = null;

    sm.selection = {
        rangeSelectStart: null,
        entries: [],
        undoableRangeSelectionAmount: 0,
        select: function(entry, type){
            switch(type){
                case 'single':
                    for(let e of sm.selection.entries){
                        e.classList.remove('active');
                    }

                    sm.selection.rangeSelectStart = entry;
                    sm.selection.entries = [entry];
                    sm.selection.undoableRangeSelectionAmount = 0;
                    entry.classList.add('active');
                    break;
                case 'add':
                    sm.selection.rangeSelectStart = entry;
                    sm.selection.undoableRangeSelectionAmount = 0;
                    entry.classList.toggle('active');

                    if(entry.classList.contains('active')){
                        sm.selection.entries.push(entry);
                    }
                    else{
                        sm.selection.entries.splice(sm.selection.entries.indexOf(entry), 1);
                    }
                    break;
                case 'range':
                    if(sm.selection.rangeSelectStart == null){
                        sm.selection.select(entry, 'single');
                        return;
                    }

                    // unselect previous range select
                    const unselectedEntries = sm.selection.entries.splice(sm.selection.entries.length - sm.selection.undoableRangeSelectionAmount, sm.selection.undoableRangeSelectionAmount);

                    for(let i = 0; i < unselectedEntries.length; i++){
                        unselectedEntries[i].classList.remove('active');
                    }

                    if(entry == sm.selection.rangeSelectStart){
                        return;
                    }

                    // select new range
                    let rangeStartIndex = Array.prototype.indexOf.call(sm.selection.rangeSelectStart.parentNode.children, sm.selection.rangeSelectStart);
                    let rangeEndIndex = Array.prototype.indexOf.call(entry.parentNode.children, entry);

                    function selectEntry(index){
                        const rangeEntry = entry.parentNode.childNodes[index];
                        sm.selection.entries.push(rangeEntry);
                        rangeEntry.classList.add('active');
                    }

                    if(rangeStartIndex < rangeEndIndex){
                        for(let i = rangeStartIndex + 1; i <= rangeEndIndex; i++){
                            selectEntry(i);
                        }
    
                        sm.selection.undoableRangeSelectionAmount = rangeEndIndex - rangeStartIndex;// - 1;    
                    }
                    else{
                        for(let i = rangeStartIndex - 1; i >= rangeEndIndex; i--){
                            selectEntry(i);
                        }
    
                        sm.selection.undoableRangeSelectionAmount = rangeStartIndex - rangeEndIndex;// - 1;    
                    }
                    break;
            }

            sm.updateInspector();
        }
    };

    sm.ldb.get('sd-webui-state-manager-autosave', autosave => {
        if(autosave == null){
            return;
        }

        sm.autosave = autosave;
        
        const autosaveCheckbox = app.querySelector('#sd-webui-sm-autosave');
        if(autosaveCheckbox){
            autosaveCheckbox.checked = autosave;
        }
    });

    sm.entryFilter = {
        group: 'history',
        types: ['txt2img', 'img2img'],
        query: '',
        matches: function(data){
            const f = sm.entryFilter;
            // const q = f.query.toLowerCase();
            const queries = f.query.toLowerCase().split(/, */);

            return data.groups.indexOf(f.group) > -1 && f.types.indexOf(data.type) > -1 &&
                   (f.query == '' || queries.every(q => data.quickSettings['Stable Diffusion checkpoint'].toLowerCase().indexOf(q) > -1 || data.generationSettings.sampler.toLowerCase().indexOf(q) > -1 ||
                    data.generationSettings.prompt.toLowerCase().indexOf(q) > -1 || data.generationSettings.negativePrompt.toLowerCase().indexOf(q) > -1 ||
                    (data.hasOwnProperty('name') && data.name.toLowerCase().indexOf(q) > -1)));
        }
    };

    sm.currentPage = 0;

    sm.injectUI = function() {
        // I really want to reuse some of the generated `svelte-xxxxxx` components, but these names have been known to change in the past (https://github.com/AUTOMATIC1111/stable-diffusion-webui/discussions/10076)
        // To get around this, we find the target elements and extract the classname for this version of the app.
        // It's still fragile af, just... slightly less so?
    
        svelteClassFromSelector = selector => Array.from(Array.from(app.querySelectorAll(selector)).find(el => Array.from(el.classList).flat().find(cls => cls.startsWith('svelte-'))).classList).find(cls => cls.startsWith('svelte-'));

        sm.svelteClasses = {
            button: svelteClassFromSelector('.lg.secondary.gradio-button.tool'),
            tab: svelteClassFromSelector('#tabs'),
            checkbox: svelteClassFromSelector('input[type=checkbox]'),
            prompt: svelteClassFromSelector('#txt2img_prompt label')
        }

        function createQuickSettingsButton(type, secondaryIconText, onClick){
            const quickSettingsButton = sm.createElementWithInnerTextAndClassList('button', '⌛', 'lg', 'sd-webui-sm-quicksettings-button', 'secondary', 'gradio-button', 'tool', sm.svelteClasses.button);
            quickSettingsButton.id = `sd-webui-sm-quicksettings-button-${type}`;
            quickSettingsButton.appendChild(sm.createElementWithInnerTextAndClassList('div', secondaryIconText, 'icon'));
            app.querySelector('#quicksettings').appendChild(quickSettingsButton);
            quickSettingsButton.addEventListener('click', onClick);

            return quickSettingsButton;
        }

        createQuickSettingsButton('toggle', '⚙', sm.toggle);
        
        const quickSettingSaveMenu = sm.createElementWithClassList('div', 'sd-webui-sm-save-menu');
        quickSettingSaveMenu.style.display = 'none';

        const quickSettingSaveButton = createQuickSettingsButton('save', '💾', () => {
            quickSettingSaveMenu.style.display = quickSettingSaveMenu.style.display == 'none' ? 'block' : 'none';
        });

        quickSettingSaveButton.addEventListener('blur', e => {
            if(!e.currentTarget.contains(e.relatedTarget)){ // not a child button that was clicked
                quickSettingSaveMenu.style.display = 'none';
            }
        });

        const quickSettingSaveCurrentButton = sm.createElementWithInnerTextAndClassList('button', 'Save current UI settings', 'lg', 'secondary', 'gradio-button', 'tool', 'svelte-cmf5ev');
        const quickSettingSaveGeneratedButton = sm.createElementWithInnerTextAndClassList('button', 'Save last generation settings', 'lg', 'secondary', 'gradio-button', 'tool', 'svelte-cmf5ev');

        quickSettingSaveMenu.appendChild(quickSettingSaveCurrentButton);
        quickSettingSaveMenu.appendChild(quickSettingSaveGeneratedButton);
        quickSettingSaveButton.appendChild(quickSettingSaveMenu);

        const quickSettingSaveButtonBlur = e => {
            if(!e.currentTarget.parentNode.contains(e.relatedTarget)){ // lost focus to an element outside the save buttons
                quickSettingSaveMenu.style.display = 'none';
            }
        }

        const showQuickSettingSaveButtonSuccess = success => {
            const quickSettingsSaveButtonIconText = app.querySelector('#sd-webui-sm-quicksettings-button-save .icon');

            if(success){
                quickSettingsSaveButtonIconText.innerText = '✓';
                quickSettingsSaveButtonIconText.style.color = '#1fbb1f';
            }
            else{
                quickSettingsSaveButtonIconText.innerText = '✖';
                quickSettingsSaveButtonIconText.style.color = '#e63d3d';
                quickSettingsSaveButtonIconText.parentNode.classList.add('sd-webui-sm-shake');
            }

            setTimeout(() => {
                quickSettingsSaveButtonIconText.innerText = '💾';
                quickSettingsSaveButtonIconText.style.color = '#ffffff';
                quickSettingsSaveButtonIconText.parentNode.classList.remove('sd-webui-sm-shake');
            }, 2000);
        }

        quickSettingSaveCurrentButton.addEventListener('click', () => {
            if(uiCurrentTab.innerText == 'txt2img' || uiCurrentTab.innerText == 'img2img'){
                const currentState = sm.getCurrentState(uiCurrentTab.innerText);
                currentState.name = "Saved UI " + new Date().toISOString().replace('T', ' ').replace(/\.\d+Z/, '');
                currentState.preview = new Error().stack.match((/(http(.)+)\/javascript\/[a-zA-Z0-9]+\.js/))[1] + "/resources/icon-saved-ui.png";

                sm.saveState(currentState, 'favourites');
                showQuickSettingSaveButtonSuccess(true); //TODO: verify it actually saved. Catch storage errors etc.
                sm.updateEntries();
            }
            else{
                showQuickSettingSaveButtonSuccess(false);
            }
        });

        quickSettingSaveCurrentButton.addEventListener('blur', quickSettingSaveButtonBlur);

        quickSettingSaveGeneratedButton.addEventListener('click', () => {
            if(sm.lastUsedState){
                sm.saveLastUsedState();
                showQuickSettingSaveButtonSuccess(true); //TODO: verify it actually saved. Catch storage errors etc.
                sm.updateEntries();
            }
            else{
                showQuickSettingSaveButtonSuccess(false);
            }
        });

        quickSettingSaveGeneratedButton.addEventListener('blur', quickSettingSaveButtonBlur);

        sm.panelContainer = sm.createElementWithClassList('div', 'sd-webui-sm-panel-container');
        const panel = sm.createElementWithClassList('div', 'sd-webui-sm-side-panel');
        const nav = sm.createElementWithClassList('div', 'sd-webui-sm-navigation');
        
        sm.inspector = sm.createElementWithClassList('div', 'sd-webui-sm-inspector');
    
        // Tabs
        const navTabs = sm.createElementWithClassList('div', 'tabs', 'gradio-tabs', sm.svelteClasses.tab);
        
        function createNavTab(label, group, isSelected){
            const button = sm.createElementWithClassList('button', sm.svelteClasses.tab);
            button.innerText = label;

            if(isSelected){
                button.classList.add('selected');
            }
            
            navTabs.appendChild(button);

            button.addEventListener('click', () => {
                button.parentNode.querySelectorAll('button').forEach(b => b.classList.toggle('selected', b == button));

                sm.entryFilter.group = group;
                sm.updateEntries();
            });
        }

        createNavTab('History', 'history', true);
        createNavTab('Favourites', 'favourites');

        const autosaveContainer = sm.createElementWithClassList('div', 'sd-webui-sm-quicksetting');
        const autosaveCheckbox = sm.createElementWithClassList('input', sm.svelteClasses.checkbox);
        autosaveCheckbox.id = 'sd-webui-sm-autosave';
        autosaveCheckbox.type = 'checkbox';
        autosaveCheckbox.checked = sm.autosave;
        
        const autosaveLabel = sm.createElementWithInnerTextAndClassList('label', 'Auto-save');
        autosaveLabel.htmlFor = 'sd-webui-sm-autosave';

        autosaveContainer.appendChild(autosaveCheckbox);
        autosaveContainer.appendChild(autosaveLabel);

        autosaveCheckbox.addEventListener('change', () => {
            sm.autoSaveHistory = !sm.autoSaveHistory;

            sm.ldb.set('sd-webui-state-manager-autosave', sm.autoSaveHistory);
        });
        
        // navTabs.appendChild(autosaveContainer);
    
        const navControlButtons = sm.createElementWithClassList('div', 'sd-webui-sm-control');
        
        navControlButtons.appendChild(autosaveContainer);
        // const navButtonOptions = '⚙';

        const navButtonMode = sm.createElementWithClassList('button', 'sd-webui-sm-inspector-mode');
        navControlButtons.appendChild(navButtonMode);
        // navButtonMode.addEventListener('click', () => panel.classList.toggle('sd-webui-sm-modal-panel'));
        navButtonMode.addEventListener('click', () => {
            sm.panelContainer.classList.toggle('sd-webui-sm-modal-panel');

            if(sm.panelContainer.classList.contains('sd-webui-sm-modal-panel')){
                sm.goToPage(Math.floor(sm.currentPage / (maxEntriesPerPage.modal / maxEntriesPerPage.docked)));
            }
            else{
                sm.goToPage(Math.floor(sm.currentPage * (maxEntriesPerPage.modal / maxEntriesPerPage.docked)));
            }
        });
        panel.addEventListener('click', e => e.stopPropagation());
        sm.panelContainer.addEventListener('click', sm.toggle);

        const navButtonClose = sm.createElementWithInnerTextAndClassList('button', '✖');
        navControlButtons.appendChild(navButtonClose);
        navButtonClose.addEventListener('click', sm.toggle);

        navTabs.appendChild(navControlButtons);


        // navTabs.appendChild(navToggleTxt2Img);
        // navTabs.appendChild(navToggleImg2Img);
    
        nav.appendChild(navTabs);
        
        // Entry container
        const entryContainer = sm.createElementWithClassList('div', 'sd-webui-sm-entry-container');

        // Search + pagination
        const entryHeader = sm.createElementWithClassList('div', 'sd-webui-sm-entry-header');
        const search = sm.createElementWithClassList('input');
        search.type = 'text';
        search.placeholder = "Filter by name, tokens, model or sampler";
        
        const searchChangeCallback = () => {
            sm.entryFilter.query = search.value;
            sm.updateEntries();
        };
        
        search.addEventListener('input', searchChangeCallback);
        search.addEventListener('change', searchChangeCallback);
        
        entryHeader.appendChild(sm.createElementWithInnerTextAndClassList('span', '🔍', 'sd-webui-sm-icon'));
        entryHeader.appendChild(search);
        
        const entryFooter = sm.createElementWithClassList('div', 'sd-webui-sm-entry-footer');
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
        sm.pageButtonNavigation.childNodes[0].addEventListener('click', () => sm.goToPage(0));
        sm.pageButtonNavigation.childNodes[1].addEventListener('click', () => sm.goToPage(Math.max(sm.currentPage - 1, 0)));
        
        const textNavigation = sm.createElementWithClassList('div', 'text-navigation');
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
        
        const handlePageInput = () => {
            sm.goToPage(Math.min(Math.max(sm.pageNumberInput.value.replaceAll(/[^\d]/g, '') - 1, sm.pageNumberInput.min), sm.pageNumberInput.max) || 0);
        }

        sm.pageNumberInput.addEventListener('change', handlePageInput);
        sm.pageNumberInput.addEventListener('blur', handlePageInput);

        entryFooter.appendChild(sm.pageButtonNavigation);
        entryFooter.appendChild(textNavigation);

        function createFilterToggle(type){
            const container = sm.createElementWithClassList('div', 'sd-webui-sm-pill-toggle');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            checkbox.id = `sd-webui-sm-filter-${type}`;
            // navToggleImg2Img.innerText = "img2img";
            checkbox.innerText = "img2img";
            
            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.innerText = type;

            container.appendChild(checkbox);
            container.appendChild(label);

            checkbox.addEventListener('change', () => {
                const typeIndex = sm.entryFilter.types.indexOf(type);

                if(checkbox.checked && typeIndex == -1){
                    sm.entryFilter.types.push(type);
                }
                else if(!checkbox.checked && typeIndex > -1){
                    sm.entryFilter.types.splice(typeIndex, 1);
                }

                sm.updateEntries();
            });

            return container;
        }

        entryHeader.appendChild(createFilterToggle('txt2img'));
        entryHeader.appendChild(createFilterToggle('img2img'));

        // Entries
        const entries = sm.createElementWithClassList('div', 'sd-webui-sm-entries');

        entryContainer.appendChild(entryHeader);
        entryContainer.appendChild(entries);
        entryContainer.appendChild(entryFooter);

        for(let i = 0; i < maxEntriesPerPage.modal; i++){ // Max amount of entries per page
            const entry = sm.createElementWithClassList('button', 'sd-webui-sm-entry');
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
        const originalSubmit = submit;
        submit = function(){
            sm.lastUsedState = sm.getCurrentState('txt2img');
            return originalSubmit(...arguments);
        }
        
        const originaSubmitImg2img = submit_img2img;
        submit_img2img = function(){
            sm.lastUsedState = sm.getCurrentState('img2img');
            return originaSubmitImg2img(...arguments);
        }

        sm.updateEntries();
    }

    sm.toggle = function(){
        app.querySelector('.sd-webui-sm-panel-container').classList.toggle('open');
    }

    sm.getMode = function(){
        return sm.panelContainer.classList.contains('sd-webui-sm-modal-panel') ? 'modal' : 'docked';
    }

    sm.goToPage = function(page){
        sm.currentPage = page;
        sm.pageNumberInput.value = page + 1;
        
        sm.updateEntries();
    }

    sm.updateEntries = function(){
        if(!sm.hasOwnProperty('memoryStorage')){ // Storage not init'd yet, defer until it's ready
            sm.updateEntriesWhenStorageReady = true;
            return;
        }

        // Clear old listeners
        entryEventListenerAbortController.abort();
        entryEventListenerAbortController = new AbortController();

        const currentMaxEntriesPerPage = maxEntriesPerPage[sm.getMode()];
        const entries = sm.panelContainer.querySelector('.sd-webui-sm-entries');        
        const filteredData = Object.fromEntries(Object.entries(sm.memoryStorage.data).filter(kv => sm.entryFilter.matches(kv[1])));
        const filteredKeys = Object.keys(filteredData).sort().reverse();
        const numPages = Math.max(Math.ceil(filteredKeys.length / currentMaxEntriesPerPage), 1);
        
        sm.pageNumberInput.max = numPages;
        sm.maxPageNumberLabel.innerText = `of ${numPages}`

        if(sm.currentPage >= numPages){
            sm.currentPage = numPages - 1;
            sm.pageNumberInput.value = numPages;
        }

        const endPagesCorrection = Math.max(3 - (numPages - sm.currentPage), 0);
        const pageButtonStart = Math.max(sm.currentPage - 2 - endPagesCorrection, 0); // 0-indexed, not by label

        for(let i = 0; i < 5; i++){
            const pageButton = sm.pageButtonNavigation.childNodes[2 + i];
            const pageNumber = pageButtonStart + i;

            if(pageNumber < numPages){
                pageButton.innerText = pageNumber + 1;
                pageButton.style.display = 'inline-block';
                pageButton.classList.toggle('active', pageNumber == sm.currentPage);

                pageButton.addEventListener('click', () => {
                    sm.goToPage(pageNumber);
                }, {signal: entryEventListenerAbortController.signal});
            }
            else{
                pageButton.style.display = 'none';
            }
        }

        // >
        sm.pageButtonNavigation.childNodes[7].addEventListener('click', () => {
            sm.goToPage(Math.min(sm.currentPage + 1, numPages));
        }, {signal: entryEventListenerAbortController.signal});
        
        // >>
        sm.pageButtonNavigation.childNodes[8].addEventListener('click', () => {
            sm.goToPage(numPages);
        }, {signal: entryEventListenerAbortController.signal});

        const dataPageOffset = sm.currentPage * currentMaxEntriesPerPage;
        const numEntries = Math.min(currentMaxEntriesPerPage, filteredKeys.length - dataPageOffset);

        for(let i = 0; i < numEntries; i++){
            const data = sm.memoryStorage.data[filteredKeys[dataPageOffset + i]];
            const entry = entries.childNodes[i];

            entry.data = data;
            entry.style.backgroundImage = `url("${data.preview}")`;
            entry.style.display = 'inherit';
            // entry.innerText = data.preview ? '' : data.generationSettings.prompt;
            
            entry.childNodes[0].innerText = `${data.type == 'txt2img' ? '🖋' : '🖼️'} ${data.type}`;
            sm.updateEntryIndicators(entry);

            entry.addEventListener('click', e => {
                if(e.shiftKey){
                    sm.selection.select(entry, 'range');
                }
                else if(e.ctrlKey || e.metaKey){
                    sm.selection.select(entry, 'add');
                }
                else{
                    // entries.querySelector('.active')?.classList.remove('active');
                    // entry.classList.add('active');
                    sm.selection.select(entry, 'single');
                }
                // sm.updateInspector();
            }, {signal: entryEventListenerAbortController.signal});
            
            entry.addEventListener('dblclick', () => sm.applyAll(data), {signal: entryEventListenerAbortController.signal});
        }

        for(let i = numEntries; i < maxEntriesPerPage.modal; i++){
            entries.childNodes[i].style.display = 'none';
        }
    }

    sm.updateEntryIndicators = function(entry){
        entry.classList.toggle('favourite', entry.data.groups.indexOf('favourites') > -1);
        entry.classList.toggle('named', entry.data.hasOwnProperty('name') && entry.data.name != undefined && entry.data.name.length > 0);
    }

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

    sm.updateInspector = function(){
        sm.inspector.innerHTML = "";

        if(sm.selection.entries.length == 0){
            return;
        }
        else if(sm.selection.entries.length > 1){
            const multiSelectContainer = sm.createElementWithClassList('div', 'category', 'meta-container');
            const favouriteAllButton = sm.createElementWithInnerTextAndClassList('button', `♥ Favourite all ${sm.selection.entries.length} selected items`, 'sd-webui-sm-inspector-wide-button', 'sd-webui-sm-inspector-load-button');
            const deleteAllButton = sm.createElementWithInnerTextAndClassList('button', `🗑 Delete all ${sm.selection.entries.length} selected items`, 'sd-webui-sm-inspector-wide-button', 'sd-webui-sm-inspector-load-button');
            
            multiSelectContainer.appendChild(favouriteAllButton);
            multiSelectContainer.appendChild(deleteAllButton);

            favouriteAllButton.addEventListener('click', () => {
                if(sm.selection.entries.every(e => e.data.groups.indexOf('favourites') > -1)){
                    sm.removeStateFromGroup(entry.data.createdAt, 'favourites');
                }
                else{
                    sm.addStateToGroup(data.createdAt, 'favourites');
                }

                for(let entry of sm.selection.entries){
                    sm.updateEntryIndicators(entry);
                }
            });

            deleteAllButton.addEventListener('click', () => {
                sm.deleteStates(true, entry.data.createdAt);
                sm.updateEntries();
            });

            sm.inspector.appendChild(multiSelectContainer);

            return;
        }
        
        const entry = sm.selection.entries[0];

        const metaContainer = sm.createElementWithClassList('div', 'category', 'meta-container');
        const nameField = document.createElement('input');
        nameField.placeholder = "Give this config a name";
        nameField.type = 'text';
        nameField.value = entry.data.name || '';
        
        const favButton = sm.createElementWithInnerTextAndClassList('button', '♥', 'sd-webui-sm-inspector-fav-button');
        const deleteButton = sm.createElementWithInnerTextAndClassList('button', '🗑', 'sd-webui-sm-inspector-delete-button');
        const loadAllButton = sm.createElementWithInnerTextAndClassList('button', 'Load all', 'sd-webui-sm-inspector-load-all-button', 'sd-webui-sm-inspector-load-button');

        favButton.classList.toggle('on', entry.data.groups.indexOf('favourites') > -1);

        metaContainer.appendChild(nameField);
        metaContainer.appendChild(favButton);
        metaContainer.appendChild(deleteButton);
        metaContainer.appendChild(loadAllButton);

        const nameChangeCallback = () => {
            sm.setStateName(entry.data.createdAt, nameField.value);
            sm.updateEntryIndicators(entry);
        };

        nameField.addEventListener('input', nameChangeCallback);
        nameField.addEventListener('change', nameChangeCallback);

        favButton.addEventListener('click', () => {
            if(entry.data.groups.indexOf('favourites') == -1){
                sm.addStateToGroup(entry.data.createdAt, 'favourites');
            }
            else{
                sm.removeStateFromGroup(entry.data.createdAt, 'favourites');
            }

            sm.updateEntryIndicators(entry);
        });

        deleteButton.addEventListener('click', () => {
            sm.deleteStates(true, ...stateManager.selection.entries.filter(e => e.data.createdAt));
            sm.updateEntries();

            if(entry.style.display != 'none'){
                entry.click();
            }
        });

        loadAllButton.addEventListener('click', () => sm.applyAll(entry.data));

        sm.inspector.appendChild(metaContainer);

        let quickSettings = entry.data.quickSettings;
        const quickSettingsContainer = sm.createElementWithClassList('div', 'category');

        // Handle checkpoint, VAE, and hypernetwork separetely. We always wanna show these first, and they need to be applied a specific way
        // const checkpointParam = sm.createInspectorParameter("Checkpoint", quickSettings.checkpoint, () => sm.setInputValue(app.querySelector('#setting_sd_model_checkpoint input'), quickSettings.checkpoint));
        // const checpointParamValueField = checkpointParam.querySelector('.param-value');
        // const checkpointHash = checpointParamValueField.innerText.match(/\[[a-f0-9]+\]/g);
        // checpointParamValueField.innerText = checpointParamValueField.innerText.replace(/\.safetensors|\.ckpt|\[[a-f0-9]+\]/g, '');
        // checpointParamValueField.appendChild(sm.createElementWithInnerTextAndClassList('span', checkpointHash, 'hash'));
        // quickSettingsContainer.appendChild(checkpointParam);

        for(const settingName in quickSettings){
            quickSettingsContainer.appendChild(sm.createInspectorParameter(settingName, quickSettings[settingName], () => sm.applyQuickParameters(quickSettings, settingName)));
        }

        const labels = Array.from(quickSettingsContainer.querySelectorAll('.label-container span'));

        const checkpointLabel = labels.find(l => l.innerText == 'Stable Diffusion checkpoint');
        checkpointLabel.innerText = "Checkpoint";

        const checkpointValueField = checkpointLabel.parentNode.parentNode.querySelector('.param-value');
        const checkpointHash = checkpointValueField.innerText.match(/\[[a-f0-9]+\]/g);
        checkpointValueField.innerText = checkpointValueField.innerText.replace(/\.safetensors|\.ckpt|\[[a-f0-9]+\]/g, '');
        checkpointValueField.appendChild(sm.createElementWithInnerTextAndClassList('span', checkpointHash, 'hash'));

        labels.find(l => l.innerText == 'SD VAE').innerText = "VAE";
        labels.find(l => l.innerText == 'Add hypernetwork to prompt').innerText = "Hypernetwork";

        const applyQuickSettingsButton = sm.createElementWithInnerTextAndClassList('button', 'Load quicksettings', 'sd-webui-sm-inspector-wide-button', 'sd-webui-sm-inspector-load-button');
        quickSettingsContainer.appendChild(applyQuickSettingsButton);

        applyQuickSettingsButton.addEventListener('click', () => {
            for(const param of applyQuickSettingsButton.parentNode.querySelectorAll('.sd-webui-sm-inspector-param')){
                if(param.querySelector('input').checked){
                    param.apply();
                }
            }
        });

        sm.inspector.appendChild(quickSettingsContainer);
        
        const generationSettingsContainer = sm.createElementWithClassList('div', 'category');

        const promptContainer = sm.createInspectorPromptSection("Prompt", entry.data.generationSettings.prompt, () => sm.applyGenerationParameters(entry.data.type, entry.data.generationSettings, 'prompt'));
        // generationSettings.appendChild(sm.createInspectorLabel("Prompt"));
        generationSettingsContainer.appendChild(promptContainer);
        
        const negativePromptContainer = sm.createInspectorPromptSection("Negative prompt", entry.data.generationSettings.negativePrompt, () => sm.applyGenerationParameters(entry.data.type, entry.data.generationSettings, 'negativePrompt'));
        // generationSettings.appendChild(sm.createInspectorLabel("Negative prompt"));
        generationSettingsContainer.appendChild(negativePromptContainer);
        
        generationSettingsContainer.appendChild(sm.createInspectorParameter("Sampling", `${entry.data.generationSettings.sampler} (${entry.data.generationSettings.steps} steps)`, () => sm.applyGenerationParameters(entry.data.type, entry.data.generationSettings, 'sampler', 'steps')));
        generationSettingsContainer.appendChild(sm.createInspectorParameter("Size", `${entry.data.generationSettings.width} x ${entry.data.generationSettings.height}`, () => sm.applyGenerationParameters(entry.data.type, entry.data.generationSettings, 'width', 'height')));
        generationSettingsContainer.appendChild(sm.createInspectorParameter("Batches", `${entry.data.generationSettings.batchSize} x ${entry.data.generationSettings.batchCount}`, () => sm.applyGenerationParameters(entry.data.type, entry.data.generationSettings, 'batchSize', 'batchCount')));
        generationSettingsContainer.appendChild(sm.createInspectorParameter("CFG", entry.data.generationSettings.cfg, () => sm.applyGenerationParameters(entry.data.type, entry.data.generationSettings, 'cfg')));
        generationSettingsContainer.appendChild(sm.createInspectorParameter("Seed", entry.data.generationSettings.seed, () => sm.applyGenerationParameters(entry.data.type, entry.data.generationSettings, 'seed')));
        generationSettingsContainer.appendChild(sm.createInspectorParameter("Use subseed", entry.data.generationSettings.showSubseed, () => sm.applyGenerationParameters(entry.data.type, entry.data.generationSettings, 'showSubseed')));

        // if(entry.data.generationSettings.showSubseed){
            generationSettingsContainer.appendChild(sm.createInspectorParameter("Variation seed", entry.data.generationSettings.subseed, () => sm.applyGenerationParameters(entry.data.type, entry.data.generationSettings, 'subseed')));
            generationSettingsContainer.appendChild(sm.createInspectorParameter("Variation strength", entry.data.generationSettings.subseedStrength, () => sm.applyGenerationParameters(entry.data.type, entry.data.generationSettings, 'subseedStrength')));
            generationSettingsContainer.appendChild(sm.createInspectorParameter("Resize seed from size", `${entry.data.generationSettings.resizeSeedFromWidth} x ${entry.data.generationSettings.resizeSeedFromHeight}`, () => sm.applyGenerationParameters(entry.data.type, entry.data.generationSettings, 'resizeSeedFromWidth', 'resizeSeedFromHeight')));
        // }

        for(const accordionName in entry.data.generationSettings.accordions){
            // generationSettingsContainer.appendChild(sm.createElementWithInnerTextAndClassList('div', accordionName, 'gradio-accordion'));
            generationSettingsContainer.appendChild(sm.createInspectorSettingsAccordion(accordionName, entry.data.generationSettings.accordions[accordionName]));
        }

        const applyGenerationButton = sm.createElementWithInnerTextAndClassList('button', 'Load generation settings', 'sd-webui-sm-inspector-wide-button', 'sd-webui-sm-inspector-load-button');
        generationSettingsContainer.appendChild(applyGenerationButton);

        applyGenerationButton.addEventListener('click', () => {
            for(const param of applyGenerationButton.parentNode.querySelectorAll('.sd-webui-sm-inspector-param')){
                if(param.parentNode.parentNode.classList.contains('gradio-accordion') && !param.parentNode.parentNode.querySelector('input[type="checkbox"]').checked){
                    continue;
                }

                if(param.querySelector('input').checked){
                    param.apply();
                }
            }
        });

        sm.inspector.appendChild(generationSettingsContainer);

        for(const scriptName in entry.data.scriptSettings){
            sm.inspector.appendChild(sm.createInspectorSettingsAccordion(scriptName, entry.data.scriptSettings[scriptName]));
        }

        const applyScriptsButton = sm.createElementWithInnerTextAndClassList('button', 'Load script settings', 'sd-webui-sm-inspector-wide-button', 'sd-webui-sm-inspector-load-button');
        sm.inspector.appendChild(applyScriptsButton);

        applyScriptsButton.addEventListener('click', () => {
            for(const param of applyScriptsButton.parentNode.querySelectorAll('.sd-webui-sm-inspector-param')){
                if(param.querySelector('input').checked){
                    param.apply();
                }
            }
        });
    }

    sm.createInspectorSettingsAccordion = function(name, data){
        const accordion = sm.createElementWithClassList('div', 'sd-webui-sm-inspector-category', 'block', 'gradio-accordion');
        
        accordion.appendChild(sm.createInspectorLabel(name));
        accordion.appendChild(sm.createElementWithInnerTextAndClassList('span', '▼', 'foldout'))
        
        const content = sm.createElementWithClassList('div', 'sd-webui-sm-inspector-category-content');
        content.style.height = '0';

        const prunedData = Object.assign({}, data);
        delete prunedData.enabled; // Not a real param

        for(const settingName in prunedData){
            content.appendChild(sm.createInspectorParameter(settingName, prunedData[settingName], () => {
                sm.applyGenerationAccordionParameters(name, prunedData, settingName);

                if(data.enabled != accordion.classList.contains('input-accordion-open')){
                    accordion.querySelector('.label-wrap').click();
                }
            }));
        }
        
        accordion.appendChild(content);

        accordion.addEventListener('click', () => {
            if(content.style.height == '100%'){
                content.style.height = '0';
                // content.style.display = 'none';
                accordion.classList.remove('open');
            }
            else{
                content.style.height = '100%';
                // content.style.display = 'block';
                accordion.classList.add('open');
            }
        });

        return accordion;
    }

    sm.createInspectorPromptSection = function(label, prompt, onUse){
        const promptContainer = sm.createElementWithClassList('div', 'prompt-container', 'sd-webui-sm-inspector-param', sm.svelteClasses.prompt);
        promptContainer.apply = onUse;
        
        const promptField = sm.createElementWithInnerTextAndClassList('textarea', prompt, 'prompt');
        promptField.readOnly = true;

        const promptButtons = sm.createElementWithClassList('div', 'prompt-button-container');
        
        // const viewPromptButton = sm.createElementWithInnerTextAndClassList('button', '👁');
        // viewPromptButton.title = "View prompt";
        
        promptButtons.appendChild(sm.createUseButton(onUse));
        promptButtons.appendChild(sm.createCopyButton(prompt));
        // promptButtons.appendChild(viewPromptButton);

        promptContainer.appendChild(sm.createInspectorLabel(label));
        promptContainer.appendChild(promptField);
        promptContainer.appendChild(promptButtons);

        return promptContainer;
    }

    sm.createInspectorParameterSection = function(value, onUse){
        const paramContainer = sm.createElementWithClassList('div', 'param-container');
        // paramContainer.onUse = onUse;

        const valueString = value?.toString();
        let valueElement;
        
        if(valueString === 'true'){
            valueElement = sm.createElementWithInnerTextAndClassList('span', '✓', 'param-value', 'true');
        }
        else if(valueString === 'false'){
            valueElement = sm.createElementWithInnerTextAndClassList('span', '✖', 'param-value', 'false');
        }
        else{
            valueElement = sm.createElementWithInnerTextAndClassList('span', valueString, 'param-value');
        }
        
        paramContainer.appendChild(valueElement);
        
        const buttonContainer = sm.createElementWithClassList('div', 'button-container');
        buttonContainer.appendChild(sm.createUseButton(onUse));
        buttonContainer.appendChild(sm.createCopyButton(value));

        paramContainer.appendChild(buttonContainer);

        return paramContainer;
    }

    sm.createUseButton = function(onUse){
        const button = sm.createElementWithInnerTextAndClassList('button', '↙️', 'sd-webui-sm-apply-button'); //alt 📋, ↙️, 🔖, or 🗳
        button.title = "Apply to prompt (overrides current)";
        button.addEventListener('click', e => {
            onUse();
            e.stopPropagation();
        });
        // button.onclick = onUse;

        return button;
    }

    sm.createCopyButton = function(value){
        const button = sm.createElementWithInnerTextAndClassList('button', '📄'); //alt 📋
        button.title = "Copy to clipboard";
        button.addEventListener('click', () => navigator.clipboard.writeText(value.toString()));

        return button;
    }

    sm.createInspectorLabel = function(label){
        const labelWithCheckbox = sm.createElementWithClassList('span', 'label-container');

        const checkbox = sm.createElementWithClassList('input', 'param-checkbox', sm.svelteClasses.checkbox);
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        checkbox.addEventListener('click', e => e.stopPropagation());
        labelWithCheckbox.appendChild(checkbox);

        labelWithCheckbox.appendChild(labelElement = sm.createElementWithInnerTextAndClassList('span', label, 'label'));

        return labelWithCheckbox;
    }

    sm.createInspectorParameter = function(label, value, onUse){
        const paramContainer = sm.createElementWithClassList('div', 'sd-webui-sm-inspector-param');
        paramContainer.apply = onUse;

        paramContainer.appendChild(sm.createInspectorLabel(label));
        paramContainer.appendChild(sm.createInspectorParameterSection(value, onUse));

        return paramContainer;
    }
    
    sm.getGalleryPreviews = function(){
        return gradioApp().querySelectorAll('div[id^="tab_"] div[id$="_results"] .thumbnail-item > img');
    }
    
    sm.getCurrentState = function(type){ //type = txt2img or img2img
        return {
            type: type,
            quickSettings: sm.getQuickSettings(),
            generationSettings: sm.getGenerationSettings(type),
            scriptSettings: sm.getScriptsSettings(),
            extraSettings: sm.getSettingsFromInputs(Array.from(app.querySelectorAll(`#${type}_settings fieldset, #${type}_settings div`)).filter(e => e.id.startsWith('setting_')).map(e => Array.from(e.querySelectorAll('input'))).flat()),
            preview: sm.createPreviewImageData()
        };
    }
    
    sm.saveState = function(state, group){
        state.createdAt = Date.now();
        state.groups = [group];
        
        sm.memoryStorage.data[state.createdAt] = state;
        sm.memoryStorage.updateKeys();
    
        sm.updateLocalStorage();
    }

    sm.deleteStates = function(requireConfirmation, ...stateKeys){
        if(requireConfirmation && confirm(`Delete ${stateKeys.length} item${stateKeys.length == 1 ? '' : 's'}? This action cannot be undone.`)){
            for(const key of stateKeys){
                delete sm.memoryStorage.data[key];
            }

            sm.memoryStorage.updateKeys();
            sm.updateLocalStorage();
        }
    }

    sm.addStateToGroup = function(stateKey, group){
        let state = sm.memoryStorage.data[stateKey];

        if(state.groups.indexOf(group) == -1){
            state.groups.push(group);
        }

        sm.updateLocalStorage();
    }
    
    sm.removeStateFromGroup = function(stateKey, group){
        let state = sm.memoryStorage.data[stateKey];

        const groupIndex = a.indexOf(group);

        if(groupIndex > -1){
            state.groups.splice(groupIndex, 1);

            if(state.groups.length == 0){
                delete sm.memoryStorage.data[stateKey];
                sm.memoryStorage.updateKeys();
            }
        }

        sm.updateLocalStorage();
    }

    sm.setStateName = function(stateKey, name){
        sm.memoryStorage.data[stateKey].name = name;

        sm.updateLocalStorage();
    }

    // sm.getFromStorage = function(){
    //     return JSON.parse(localStorage.getItem('sd-webui-state-manager-data')) || {};
    // }

    sm.getLocalStorage = function(callback){
        sm.ldb.get('sd-webui-state-manager-data', async storedData => {
            if(storedData == null || storedData == '[]'){
                callback({});
                return;
            }

            const bytes = Uint8Array.from(JSON.parse(storedData));
            const decompressed = await sm.utils.decompress(bytes);

            callback(JSON.parse(decompressed) || {});
        });
    }

    sm.updateLocalStorage = async function(){
        // We compress the raw JSON using gzip, then convert the uint8Array into a regular array that stringifies more nicely, and store that.
        // I couldn't be bothered to test this with real-world data, but I *strongly* suspect this is the most space-efficient way
        // due to the great amounts of repetition in entry strings (such as 'SDE++ 2M Karras' and `longCheckpointMixNameV1.23 [3942ab99c]` e.g.)
        const compressed = await stateManager.utils.compress(JSON.stringify(sm.memoryStorage.data));
        sm.ldb.set('sd-webui-state-manager-data', JSON.stringify(Array.from(compressed)));
    }

    sm.getStateData = function(group){
        let result = [];

        for(let key of sm.memoryStorage.keys){
            const data = sm.memoryStorage.data[key];

            if(!group || group == 'all' || (data.groups.indexOf(group) > -1)){
                // data.createdAt = key;
                result.push(data);
            }
        }

        return result;
    }

    sm.clearHistory = function(){
        for(const key of sm.memoryStorage.keys){
            const data = sm.memoryStorage.data[key];

            if(data.groups.length == 1 && data.groups[0] == 'history' && (!data.hasOwnProperty('name') || data.name == '')){
                delete sm.memoryStorage.data[key];
            }
        }

        sm.memoryStorage.updateKeys();
        sm.updateLocalStorage();
    }

    sm.applyAll = function(data){
        let generationParams = Object.keys(data.generationSettings);
        delete generationParams.accordions;

        sm.applyQuickParameters(data.quickSettings, ...Object.keys(data.quickSettings));
        sm.applyGenerationParameters(data.type, data.generationSettings, ...generationParams);
        
        for(const scriptName in data.scriptSettings){
            const scriptSettings = data.scriptSettings[scriptName];
            sm.applyScriptParameters(scriptName, scriptSettings, ...Object.keys(scriptSettings));
        }

        const accordionLabels = Array.from(app.querySelectorAll('#txt2img_accordions .input-accordion .label-wrap'));

        for(const accordionName in data.generationSettings.accordions){
            const label = accordionLabels.find(l => l.innerText.startsWith(accordionName));

            if(!label){
                console.log(`Could not apply settings for gen. accordion '${accordionName}'; no accordion UI found`);
                continue;
            }

            if(data.generationSettings.accordions[accordionName].enabled != label.parentNode.classList.contains('input-accordion-open')){
                label.click();
            }
        }
    }

    sm.applyQuickParameters = function(data, ...params){
        const quickSettingsContainer = app.querySelector('#quicksettings');
        const inputs = Array.from(quickSettingsContainer.querySelectorAll('input'));
        
        sm.tryApplyingParams(inputs, data, ...params);
    }
    
    sm.applyGenerationParameters = function(type, data, ...params){
        const selectors = type == 'txt2img' ? txt2imgGenerationSettingSelectors : img2imgGenerationSettingSelectors;

        for(const param of params) {
            const input = app.querySelector(selectors[param]);

            if(!input){
                console.warn(`Could not set generation param ${param}; no matching input found`);
                return;
            }

            sm.setInputValue(input, data[param]);
        }
    }

    sm.applyGenerationAccordionParameters = function(name, data, ...params){
        const containerLabel = Array.from(app.querySelectorAll("#txt2img_accordions .label-wrap span")).find(el => el.innerText.startsWith(`${name}`));
        
        if(!containerLabel){
            console.warn(`Could not set param for gen. accordion '${name}'; no matching UI accordion found`);
            return;
        }

        const container = containerLabel.parentNode.parentNode;
        const inputs = Array.from(container.querySelectorAll("input"));

        let prunedParams = params;
        delete prunedParams.enabled; // Not a real param

        sm.tryApplyingParams(inputs, data, ...prunedParams);
    }

    sm.applyScriptParameters = function(scriptName, data, ...params){
        const containerLabel = Array.from(app.querySelectorAll("#txt2img_script_container .label-wrap span")).find(el => el.innerText.startsWith(`${scriptName}`));
        
        if(!containerLabel){
            console.warn(`Could not set param for script ${scriptName}; no matching script section found`);
            return;
        }

        const container = containerLabel.parentNode;
        const inputs = Array.from(container.querySelectorAll("input"));

        sm.tryApplyingParams(inputs, data, ...params);
    }

    sm.tryApplyingParams = function(inputs, data, ...params){
        // let inputLabelMap = {};
        let inputLabels = [];

        for(const input of inputs){
            // inputLabelMap[input] = sm.getLabelFromInput(input);
            inputLabels.push(sm.getLabelFromInput(input));
        }

        for(const param of params) {
            const input = inputLabels.find(l => l?.innerText == param)?.parentNode.parentNode.querySelector('input');
            
            if(!input){
                console.warn(`Could not apply param ${param}; no matching input found`);
                return;
            }

            sm.setInputValue(input, data[param]);
        }
    }

    sm.setInputValue = function(input, value){
        if(input.type == 'checkbox' || input.type == 'radio'){
            input.checked = value;
        }
        else{
            // Handle dropdown special case
            if(input.type == 'text' && sm.getDropdownRoot(input)){
                sm.setDropdownValue(input, value);
            }
            
            input.value = value;
        }

        // Some inputs do not update simply on `change`
        input.dispatchEvent(new Event('input'));
        input.dispatchEvent(new Event('keydown'));
        input.dispatchEvent(new Event('change'));
        // input.dispatchEvent(new Event('blur'));
    }

    sm.getDropdownRoot = function(element){
        let parent = element;

        for(let i = 0; i < 7; i++){ // should be 5, but +2 just in case
            parent = parent.parentNode;
            
            if(parent.classList.contains('gradio-dropdown')){
                return parent;
            }
        }

        return null;
    }

    // Hey Gradio, could we have like, a normal way of selecting a value, pretty please? sheesh...
    sm.setDropdownValue = async function(input, value){
        input.dispatchEvent(new Event('focus'));
        input.value = value;
        
        await new Promise(r => setTimeout(r, 1));
        
        input.dispatchEvent(new Event('input'));
        input.dispatchEvent(new Event('change'));
        
        await new Promise(r => setTimeout(r, 1));

        const keyDownEvent = new Event('keydown')
        keyDownEvent.key = 'Enter'
        
        input.dispatchEvent(keyDownEvent);
    }

    sm.getQuickSettings = function(){
        let settings = sm.getSettingsFromContainer(app.querySelector('#quicksettings'));

        // Add checkpoint, VAE, and hypernetwork manually due to different ui structure
        // settings.checkpoint = app.querySelector('#setting_sd_model_checkpoint input').value;

        // const vaeInput = app.querySelector('#setting_sd_vae input');
        // if(vaeInput){
        //     settings.model = vaeInput.value;
        // }

        // const hyperNetworkInput = app.querySelector('#setting_sd_hypernetwork input');
        // if(hyperNetworkInput){
        //     settings.model = hyperNetworkInput.value;
        // }

        return settings;
    }
    
    sm.getGenerationSettings = function(type){
        const selectors = type == 'txt2img' ? txt2imgGenerationSettingSelectors : img2imgGenerationSettingSelectors;
        let settings = {};
    
        for(let key in selectors){
            settings[key] = sm.getInputValue(app.querySelector(selectors[key]));
        }

        settings.accordions = {};

        const accordions = app.querySelectorAll('#txt2img_accordions .input-accordion');

        for(const accordion of accordions){
            let accordionSettings = sm.getSettingsFromContainer(accordion);
            accordionSettings.enabled = accordion.classList.contains('input-accordion-open');

            settings.accordions[accordion.querySelector('span').innerText] = accordionSettings;
        }
    
        return settings;
    }
    
    // This is super hacky, but there doesn't seem to be a way to access all extensions + their current settings nicely? At least from JS
    sm.getScriptsSettings = function(){
        let scriptSettings = {};
    
        for(const scriptLabel of app.querySelectorAll("#txt2img_script_container .label-wrap")){
            // let settings = {};
    
            // for(const input of scriptLabel.parentNode.querySelectorAll("input")){
            //     const label = input.parentNode.querySelector('span');
    
            //     if(!label || !label.innerText){
            //         continue;
            //     }
    
            //     settings[label.innerText] = sm.getInputValue(input);
            // }
    
            // scriptSettings[scriptLabel.childNodes[0].innerText] = settings;

            scriptSettings[scriptLabel.childNodes[0].innerText] = sm.getSettingsFromContainer(scriptLabel.parentNode);
        }
    
        return scriptSettings;
    }

    sm.getSettingsFromContainer = function(container){        
        return sm.getSettingsFromInputs(container.querySelectorAll("input"));
    }

    sm.getSettingsFromInputs = function(inputs){
        if(!Array.isArray(inputs)){ // Can be a NodeList
            inputs = Array.from(inputs);
        }
        
        let settings = {};

        for(const input of inputs){
            if(serializeInputTypes.indexOf(input.type) == -1){
                continue;
            }

            let label = input.parentNode.querySelector('span');

            if(!label || !label.innerText){
                if(input.type == 'text'){
                    const dropdownRoot = sm.getDropdownRoot(input);

                    if(dropdownRoot){
                        label = dropdownRoot.querySelector("span");
                    }
                }

                if(!label || !label.innerText){
                    continue;
                }
            }

            settings[label.innerText] = sm.getInputValue(input);
        }

        return settings;
    }

    sm.getLabelFromInput = function(input){
        let label = input.parentNode.querySelector('span');

        if((!label || !label.innerText) && input.type == 'text'){ // We might be a dropdown
            label = input.parentNode.parentNode.parentNode.parentNode.parentNode.querySelector("span");

            // if(!label || !label.innerText){
            //     return null;
            // }
        }

        return label;
    }
    
    sm.createPreviewImageData = function(){
        if(!sm.lastHeadImage){
            return undefined;
        }
    
        const galleryPreviews = sm.getGalleryPreviews();
    
        const image = (galleryPreviews.length > 1 && galleryPreviews[0].src.includes("grids/")) ? galleryPreviews[1] : galleryPreviews[0];
    
        // const imageSize = {x: 100, y: 100};
    
        const scale = 100 / Math.max(image.naturalWidth, image.naturalHeight);
    
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
      
        // Set width and height
        canvas.width = image.naturalWidth * scale;
        canvas.height = image.naturalHeight * scale;
      
        // Draw image and export to a data-uri
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        const dataURI = canvas.toDataURL();
    
        return dataURI;
    }
    
    sm.createElementWithClassList = function(tagName, ...classes){ //todo: auto-add sd-webui-sm- before classes?
        const element = document.createElement(tagName);
    
        for(const className of classes) {
            element.classList.add(className);
        }
    
        return element;
    }

    sm.createElementWithInnerTextAndClassList = function(tagName, innerText, ...classes){
        const element = sm.createElementWithClassList(tagName, ...classes);

        element.innerText = innerText;
    
        return element;
    }
    
    sm.getInputValue = function(input){
        if(!input){
            return undefined;
        }

        return (input.type == 'checkbox' || input.type == 'radio') ? input.checked : input.value;
    }

    // Stolen from `notification.js`, but can't use same `headImg`. Really wish webui had more callbacks
    sm.checkHeadImage = function(){
        const galleryPreviews = sm.getGalleryPreviews();

        if (galleryPreviews == null) return;

        const headImage = galleryPreviews[0]?.src;

        if (headImage == null || headImage == sm.lastHeadImage) return;

        sm.lastHeadImage = headImage;

        // const imgs = new Set(Array.from(galleryPreviews).map(img => img.src));

        if(sm.autoSaveHistory){
            sm.saveLastUsedState();
        }
    }

    sm.saveLastUsedState = function(){
        sm.lastUsedState.preview = sm.createPreviewImageData();

        if(sm.lastUsedState.generationSettings.seed == '-1'){ // Try and grab the actual seed used
            let seedFromHTMLInfo = Number(app.querySelector('#html_info_txt2img p').innerText.match(/Seed: (\d+)/)[1]);
            const selectedThumbnail = app.querySelector('#txt2img_gallery .thumbnail-item.selected');

            // If we've got thumbnail i selected, then 0 = grid (seed N), 1 = first image (seed N), 2 = second image (seed N+1), ...
            if(selectedThumbnail != undefined){
                const thumbnailIndex = Array.prototype.indexOf.call(selectedThumbnail.parentNode.children, selectedThumbnail);
                
                seedFromHTMLInfo -= Math.max(thumbnailIndex - 1, 0);
            }
            
            sm.lastUsedState.generationSettings.seed = seedFromHTMLInfo;
        }

        sm.saveState(sm.lastUsedState, 'history');
        sm.updateEntries(); // TODO: if we're on history tab
    }

    // Shamelessly yoinked from https://www.syncfusion.com/blogs/post/deep-compare-javascript-objects.aspx
    sm.utils = {
        isDeepEqual: (object1, object2) => {
            const objKeys1 = Object.keys(object1);
            const objKeys2 = Object.keys(object2);
        
            if (objKeys1.length !== objKeys2.length) return false;
        
            for(let key of objKeys1){
                const value1 = object1[key];
                const value2 = object2[key];
            
                const isObjects = sm.utils.isObject(value1) && sm.utils.isObject(value2);
            
                if((isObjects && !sm.utils.isDeepEqual(value1, value2)) || (!isObjects && value1 !== value2)){
                    return false;
                }
            }

            return true;
        },

        isObject: (object) => {
            return object != null && typeof object === "object";
        },

        // https://evanhahn.com/javascript-compression-streams-api-with-strings/
        compress: async function(str) {
            const stream = new Blob([str]).stream();
            const compressedStream = stream.pipeThrough(new CompressionStream("gzip"));
            const chunks = [];

            // Not supported in anything other than FF yet
            // for await (const chunk of compressedStream) {
            //     chunks.push(chunk);
            // }

            const reader = compressedStream.getReader();

            await reader.read().then(function processChunk({done, value}) {
                if(done) {
                  return;
                }
                
                chunks.push(value);
                return reader.read().then(processChunk);
            });
            
            return await sm.utils.concatUint8Arrays(chunks);
        },
        
        decompress: async function(compressedBytes) {
            const stream = new Blob([compressedBytes]).stream();
            const decompressedStream = stream.pipeThrough(new DecompressionStream("gzip"));
            const chunks = [];
            
            // Not supported in anything other than FF yet
            // for await (const chunk of decompressedStream) {
                //     chunks.push(chunk);
                // }
                
            const reader = decompressedStream.getReader();

            await reader.read().then(function processChunk({done, value}) {
                if(done) {
                  return;
                }
                
                chunks.push(value);
                return reader.read().then(processChunk);
            });
            
            const stringBytes = await sm.utils.concatUint8Arrays(chunks);
        
            return new TextDecoder().decode(stringBytes);
        },
        
        concatUint8Arrays: async function(uint8arrays) {
            const blob = new Blob(uint8arrays);
            const buffer = await blob.arrayBuffer();

            return new Uint8Array(buffer);
        }
    };

    sm.getLocalStorage(storedData => {
        sm.memoryStorage = {
            data: storedData,
            keys: null,
            updateKeys: function(){
                sm.memoryStorage.keys = Object.keys(sm.memoryStorage.data);
                sm.memoryStorage.keys.sort().reverse();
            }
        };
    
        sm.memoryStorage.updateKeys();

        if(sm.hasOwnProperty('updateEntriesWhenStorageReady')){
            sm.updateEntries();
        }
    });

    onUiLoaded(sm.injectUI);
    onAfterUiUpdate(sm.checkHeadImage);
})(window.stateManager = window.stateManager || {});