declare let gradioApp: any;
declare let gradio_config: any;
declare let uiCurrentTab: any;
declare let submit: any;
declare let submit_img2img: any;
declare let onUiLoaded: (callback) => void;
declare let onAfterUiUpdate: (callback) => void;

interface Window {
    stateManager: StateManager
}

interface StateManager {
    componentMap: {[key: string]: MappedComponentData},
    memoryStorage: MemoryStorage,
    selection: EntrySelection,
    [key: string]: any
}

interface MemoryStorage {
    currentDefault: any,
    savedDefaults: any, // {hash: {path: value} contents}
    entries: {
        data: {[createdAt: string]: State}
        orderedKeys: string[],
        updateKeys: () => void
    }
}

interface State {
    saveVersion: string,
    createdAt?: number,
    name?: string,
    groups?: Group[],
    type: GenerationType,
    defaults: string, // hash
    quickSettings: any,
    componentSettings: any,
    // addedSettings, face rstore, face restore model, tiling
    preview: string
}

interface StoredData { // As stored on disk, either in file or IDB
    defaults: {[hash: string]: any},
    entries: {[createdAt: string]: State}
}

interface MappedComponentData {
    entries: MappedComponent[],
    onChange?: () => void
}

interface MappedComponent {
    component: any,
    element: HTMLElement
}

interface SettingPathInfo {
    basePath: string
    index: Number,
}

interface EntrySelection {
    rangeSelectStart: Entry | null,
    entries: Entry[],
    undoableRangeSelectionAmount: number,
    select: (entry: Entry, type: SelectionType) => void
}

interface Entry extends HTMLElement {
    data: State
}

interface InspectorParameter extends HTMLElement {
    apply: () => void,
    update: () => void
}

type GenerationType = 'txt2img' | 'img2img';
type SelectionType = 'single' | 'add' | 'range';
type Group = 'history' | 'favourites';
type FileTransferDirection = 'idb2file' | 'file2idb';
type FileTransferMethod = 'merge' | 'overwrite';
type SaveLocation = 'Browser\'s Indexed DB' | 'File';

(function(sm: StateManager): void{
    // https://github.com/DVLP/localStorageDB - Allows use of indexedDB with a simple localStorage-like wrapper
    // @ts-ignore
    !function(){var s,c,e="undefined"!=typeof window?window:{},t=e.indexedDB||e.mozIndexedDB||e.webkitIndexedDB||e.msIndexedDB;"undefined"==typeof window||t?((t=t.open("ldb",1)).onsuccess=function(e){s=this.result},t.onerror=function(e){console.error("indexedDB request error"),console.log(e)},t={get:(c={ready:!(t.onupgradeneeded=function(e){s=null,e.target.result.createObjectStore("s",{keyPath:"k"}).transaction.oncomplete=function(e){s=e.target.db}}),get:function(e,t){s?s.transaction("s").objectStore("s").get(e).onsuccess=function(e){e=e.target.result&&e.target.result.v||null;t(e)}:setTimeout(function(){c.get(e,t)},50)},set:function(t,n,o){if(s){let e=s.transaction("s","readwrite");e.oncomplete=function(e){"Function"==={}.toString.call(o).slice(8,-1)&&o()},e.objectStore("s").put({k:t,v:n}),e.commit()}else setTimeout(function(){c.set(t,n,o)},50)},delete:function(e,t){s?s.transaction("s","readwrite").objectStore("s").delete(e).onsuccess=function(e){t&&t()}:setTimeout(function(){c.delete(e,t)},50)},list:function(t){s?s.transaction("s").objectStore("s").getAllKeys().onsuccess=function(e){e=e.target.result||null;t(e)}:setTimeout(function(){c.list(t)},50)},getAll:function(t){s?s.transaction("s").objectStore("s").getAll().onsuccess=function(e){e=e.target.result||null;t(e)}:setTimeout(function(){c.getAll(t)},50)},clear:function(t){s?s.transaction("s","readwrite").objectStore("s").clear().onsuccess=function(e){t&&t()}:setTimeout(function(){c.clear(t)},50)}}).get,set:c.set,delete:c.delete,list:c.list,getAll:c.getAll,clear:c.clear},sm.ldb=t,"undefined"!=typeof module&&(module.exports=t)):console.error("indexDB not supported")}();

    const app = gradioApp();
    const looselyEqualUIValues = new Set([null, undefined, "", "None"]);
    const maxEntriesPerPage = {
        docked: 80,
        modal: 400
    };
    
    let entryEventListenerAbortController = new AbortController();

    sm.autoSaveHistory = true;
    sm.lastHeadImage = null;
    sm.lastUsedState = null;

    sm.ldb.get('sd-webui-state-manager-autosave', autosave => {
        if(autosave == null){
            sm.autoSaveHistory = false;  // Set default to false instead of undefined or true
        } else {
            sm.autoSaveHistory = autosave;
        }
    
        const autosaveCheckbox = app.querySelector('#sd-webui-sm-autosave');

        if(autosaveCheckbox){
            autosaveCheckbox.checked = false;
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
    
        // @ts-ignore
        const svelteClassFromSelector = selector => Array.from(Array.from(app.querySelectorAll(selector)).find(el => Array.from(el.classList).flat().find(cls => cls.startsWith('svelte-'))).classList).find(cls => cls.startsWith('svelte-'));

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
            if(quickSettingSaveMenu.style.display == 'none'){
                quickSettingSaveMenu.style.display = 'block';
                quickSettingSaveMenu.style.left = '0';

                const right = quickSettingSaveMenu.getBoundingClientRect().right;

                if(right > window.innerWidth){
                    quickSettingSaveMenu.style.left =`calc(${window.innerWidth - right}px - 1em)`;
                }
            }
            else{
                quickSettingSaveMenu.style.display = 'none';
            }
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

        quickSettingSaveCurrentButton.addEventListener('click', async () => {
            const generationType = sm.utils.getCurrentGenerationTypeFromUI();

            if(generationType != null){
                const currentState = await sm.getCurrentState(generationType);
                currentState.name = "Saved UI " + new Date().toISOString().replace('T', ' ').replace(/\.\d+Z/, '');
                currentState.preview = new Error().stack!.match((/(http(.)+)\/javascript\/[a-zA-Z0-9]+\.js/))![1] + "/resources/icon-saved-ui.png";

                sm.saveState(currentState, 'favourites');
                showQuickSettingSaveButtonSuccess(true);
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
                showQuickSettingSaveButtonSuccess(true);
                sm.updateEntries();
            }
            else{
                showQuickSettingSaveButtonSuccess(false);
            }
        });

        quickSettingSaveGeneratedButton.addEventListener('blur', quickSettingSaveButtonBlur);

        sm.panelContainer = sm.createElementWithClassList('div', 'sd-webui-sm-panel-container');
        const panel = sm.createElementWithClassList('div', 'sd-webui-sm-side-panel');

        if(sm.hasOwnProperty('legacyData')){
            const infoDiv = sm.createElementWithClassList('div', 'sd-webui-sm-info');
            infoDiv.appendChild(sm.createElementWithInnerTextAndClassList('h1', "⚠️ Warning ⚠️"));

            const messageDiv = sm.createElementWithClassList('div');
            messageDiv.innerHTML = " \
            You are currently using State Manager 2.0, but your localstorage contains saved data from the previous version. Unfortunately, the two are not compatible. \
            <br><br> \
            If you wish to continue using this new version, you will lose your old saved states. If you want, you can click the button below to first export your existing data to a somewhat human-readable format and store in it a file for future reference. \
            <br><br> \
            If you would prefer to go back to version 1.0, you can either: \
            <br><br> \
            <ul> \
            <li>Go to <a href='https://github.com/SenshiSentou/sd-webui-state-manager'>the State Manager GitHub page</a>, select the <pre>V1.0-legacy</pre> branch, download the zip, and replace the <pre>sd-webui/extensions/sd-webui-state-manager</pre> folder with it.</li> \
            <li>Open a terminal, navigate (<pre>cd</pre>) to your <pre>sd-webui/extensions/sd-webui-state-manager</pre> folder, and run <pre>git checkout V1.0-legacy</pre>.</li> \
            </ul> \
            ";

            infoDiv.appendChild(messageDiv);
            
            const buttonContainer = sm.createElementWithClassList('div', 'sd-webui-sm-button-container');
            const exportButton = sm.createElementWithInnerTextAndClassList('button', "Export old save data to JSON file");
            exportButton.addEventListener('click', () => {
                sm.api.post("exportlegacy", {contents: JSON.stringify(sm.legacyData)})
                .then(response => {
                    if(!sm.utils.isValidResponse(response, 'success', 'path') || !response.success){
                        Promise.reject(response);
                        return;
                    }

                    alert(`Success! The save data was succesfully exported to ${response.path}`);
                })
                .catch(e => alert(`There was an error exporting the data: ${e}`));
            });

            const continueButton = sm.createElementWithInnerTextAndClassList('button', "Delete old save data and refresh the page (this cannot be undone!)");
            continueButton.addEventListener('click', () => {
                sm.ldb.delete('sd-webui-state-manager-data', () => location.reload());
            });
            
            buttonContainer.appendChild(exportButton);
            buttonContainer.appendChild(continueButton);
            
            infoDiv.appendChild(buttonContainer);

            panel.appendChild(infoDiv);
            sm.panelContainer.appendChild(panel);
            app.querySelector('.contain').appendChild(sm.panelContainer);

            sm.panelContainer.classList.add('sd-webui-sm-modal-panel');
            sm.panelContainer.classList.add('open');

            return;
        }

        const nav = sm.createElementWithClassList('div', 'sd-webui-sm-navigation');
        
        sm.inspector = sm.createElementWithClassList('div', 'sd-webui-sm-inspector');
    
        // Tabs
        const navTabs = sm.createElementWithClassList('div', 'tabs', 'gradio-tabs', sm.svelteClasses.tab);
        
        function createNavTab(label: string, group: Group, isSelected?: boolean){
            const button = sm.createElementWithInnerTextAndClassList('button', label, sm.svelteClasses.tab);

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
        autosaveCheckbox.checked = sm.autoSaveHistory;
        
        const autosaveLabel = sm.createElementWithInnerTextAndClassList('label', 'Auto-save');
        autosaveLabel.htmlFor = 'sd-webui-sm-autosave';

        autosaveContainer.appendChild(autosaveCheckbox);
        autosaveContainer.appendChild(autosaveLabel);

        autosaveCheckbox.addEventListener('change', () => {
            sm.autoSaveHistory = !sm.autoSaveHistory;

            sm.ldb.set('sd-webui-state-manager-autosave', sm.autoSaveHistory);
        });
    
        const navControlButtons = sm.createElementWithClassList('div', 'sd-webui-sm-control');
        
        navControlButtons.appendChild(autosaveContainer);
        // const navButtonOptions = '⚙';

        const navButtonMode = sm.createElementWithClassList('button', 'sd-webui-sm-inspector-mode');
        navControlButtons.appendChild(navButtonMode);
        
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

        function createFilterToggle(type: string){
            return sm.createPillToggle(type, {title: `Show ${type} entries`}, `sd-webui-sm-filter-${type}`, true, (isOn: Boolean) => {
                const typeIndex = sm.entryFilter.types.indexOf(type);

                if(isOn && typeIndex == -1){
                    sm.entryFilter.types.push(type);
                }
                else if(!isOn && typeIndex > -1){
                    sm.entryFilter.types.splice(typeIndex, 1);
                }

                sm.updateEntries();
            }, false);
        }

        entryHeader.appendChild(createFilterToggle('txt2img'));
        entryHeader.appendChild(createFilterToggle('img2img'));

        entryHeader.appendChild(sm.createPillToggle('', {title: "Display creation time in entries", id: 'sd-webui-sm-inspector-view-entry-footer'}, 'sd-webui-sm-inspector-view-entry-footer-checkbox', false, (isOn: boolean) => entryContainer.dataset['showEntryFooter'] = isOn, true));

        // Entries
        const entries = sm.createElementWithClassList('div', 'sd-webui-sm-entries');

        entryContainer.appendChild(entryHeader);
        entryContainer.appendChild(entries);
        entryContainer.appendChild(entryFooter);

        for(let i = 0; i < maxEntriesPerPage.modal; i++){ // Max amount of entries per page
            const entry = sm.createElementWithClassList('button', 'sd-webui-sm-entry');
            entry.style.display = 'none';

            entry.appendChild(sm.createElementWithClassList('div', 'type'));

            const footer = sm.createElementWithClassList('div', 'footer');
            footer.appendChild(sm.createElementWithClassList('div', 'date'));
            footer.appendChild(sm.createElementWithClassList('div', 'time'));

            entry.appendChild(footer);

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
        submit = async function(){
            sm.lastUsedState = await sm.getCurrentState('txt2img');
            return originalSubmit(...arguments);
        }
        
        const originaSubmitImg2img = submit_img2img;
        submit_img2img = async function(){
            sm.lastUsedState = await sm.getCurrentState('img2img');
            return originaSubmitImg2img(...arguments);
        }

        sm.updateEntries();

        app.addEventListener('input', sm.updateAllValueDiffDatas);
        app.addEventListener('change', sm.updateAllValueDiffDatas);
    }

    sm.updateAllValueDiffDatas = function(){
        for(const element of app.querySelectorAll('[data-value-diff]')){
            element.update?.();
        }
    }

    sm.createPillToggle = function(label: string, htmlProperties: {[title: string]: string}, checkboxId: string, isOn: boolean, onchange: (isOn: boolean) => void, immediatelyCallOnChange: boolean): HTMLElement{
        const container = sm.createElementWithClassList('div', 'sd-webui-sm-pill-toggle');

        for(const propName in htmlProperties){
            container[propName] = htmlProperties[propName];
        }
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = isOn;
        checkbox.id = checkboxId;
        
        const labelElement = document.createElement('label');
        labelElement.htmlFor = checkbox.id;
        labelElement.innerText = label;

        container.appendChild(checkbox);
        container.appendChild(labelElement);

        checkbox.addEventListener('change', () => onchange(checkbox.checked));

        if(immediatelyCallOnChange){
            onchange(checkbox.checked);
        }

        return container;
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
        const filteredData = Object.fromEntries(Object.entries(sm.memoryStorage.entries.data).filter(kv => sm.entryFilter.matches(kv[1])));
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
            const data = sm.memoryStorage.entries.data[filteredKeys[dataPageOffset + i]];
            const entry = entries.childNodes[i];

            entry.data = data;
            entry.style.backgroundImage = `url("${data.preview}")`;
            entry.style.display = 'inherit';

            const creationDate = new Date(data.createdAt);

            entry.querySelector('.type').innerText = `${data.type == 'txt2img' ? '🖋' : '🖼️'} ${data.type}`;
            entry.querySelector('.date').innerText = `${creationDate.getDate().toString().padStart(2, '0')}-${(creationDate.getMonth() + 1).toString().padStart(2, '0')}-${creationDate.getFullYear().toString().padStart(2, '0')}`;
            entry.querySelector('.time').innerText = `${creationDate.getHours().toString().padStart(2, '0')}:${creationDate.getMinutes().toString().padStart(2, '0')}:${creationDate.getSeconds().toString().padStart(2, '0')}`;
            
            sm.updateEntryIndicators(entry);

            entry.addEventListener('click', e => {
                if(e.shiftKey){
                    sm.selection.select(entry, 'range');
                }
                else if(e.ctrlKey || e.metaKey){
                    sm.selection.select(entry, 'add');
                }
                else{
                    sm.selection.select(entry, 'single');
                }
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

    sm.updateInspector = async function(){
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
                const addOrRemove = sm.selection.entries.every(e => e.data.groups && e.data.groups.indexOf('favourites') > -1) ? sm.removeStateFromGroup : sm.addStateToGroup;

                for(let entry of sm.selection.entries){
                    addOrRemove(entry.data.createdAt, 'favourites');
                    sm.updateEntryIndicators(entry);
                }
            });

            deleteAllButton.addEventListener('click', () => {
                sm.deleteStates(true, ...sm.selection.entries.map(e => e.data.createdAt));
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

        favButton.title = "Add this entry to your favourites";
        deleteButton.title = "Delete this entry (warning: this cannot be undone)";
        loadAllButton.title = "Apply all settings to the current UI";

        favButton.classList.toggle('on', entry.data.groups && entry.data.groups.indexOf('favourites') > -1);

        metaContainer.appendChild(nameField);
        metaContainer.appendChild(favButton);
        metaContainer.appendChild(deleteButton);
        metaContainer.appendChild(loadAllButton);

        const viewSettingsContainer = sm.createElementWithClassList('div', 'category', 'view-settings-container');
        viewSettingsContainer.appendChild(sm.createPillToggle('', {title: "Color-code properties (green = unchanged, orange = missing from current UI, red = different from current UI)", id: 'sd-webui-sm-inspector-view-coloured-labels'}, 'sd-webui-sm-inspector-view-coloured-labels-checkbox', true, (isOn: boolean) => sm.inspector.dataset['useColorCode'] = isOn, true));
        viewSettingsContainer.appendChild(sm.createPillToggle('unchanged', {title: "Show unchanged properties", id: 'sd-webui-sm-inspector-view-unchanged'}, 'sd-webui-sm-inspector-view-unchanged-checkbox', true, (isOn: boolean) => sm.inspector.dataset['showUnchanged'] = isOn, true));
        viewSettingsContainer.appendChild(sm.createPillToggle('missing/obsolete', {title: "Show properties that are missing from the current UI", id: 'sd-webui-sm-inspector-view-missing'}, 'sd-webui-sm-inspector-view-missing-checkbox', true, (isOn: boolean) => sm.inspector.dataset['showMissing'] = isOn, true));
        viewSettingsContainer.appendChild(sm.createPillToggle('Try applying missing/obsolete', {title: "Try applying the values of missing properties", id: 'sd-webui-sm-inspector-apply-missing'}, 'sd-webui-sm-inspector-apply-missing-checkbox', false, (isOn: boolean) => sm.inspector.dataset['applyMissing'] = isOn, true));

        const nameChangeCallback = () => {
            sm.setStateName(entry.data.createdAt, nameField.value);
            sm.updateEntryIndicators(entry);
        };

        nameField.addEventListener('input', nameChangeCallback);
        nameField.addEventListener('change', nameChangeCallback);

        favButton.addEventListener('click', () => {
            if(!entry.data.groups || entry.data.groups.indexOf('favourites') == -1){
                sm.addStateToGroup(entry.data.createdAt, 'favourites');
            }
            else{
                sm.removeStateFromGroup(entry.data.createdAt, 'favourites');
            }

            sm.updateEntryIndicators(entry);
        });

        deleteButton.addEventListener('click', () => {
            sm.deleteStates(true, entry.data.createdAt);
            sm.updateEntries();

            if(entry.style.display != 'none'){
                entry.click();
            }
        });

        loadAllButton.addEventListener('click', () => sm.applyAll(entry.data));

        sm.inspector.appendChild(metaContainer);
        sm.inspector.appendChild(viewSettingsContainer);
        
        const quickSettingLabelRenames = {
            'sd_model_checkpoint': 'Checkpoint',
            'sd_vae': 'VAE',
            'CLIP_stop_at_last_layers': 'CLIP skip',
            'sd_hypernetwork': 'Hypernetwork',
        };

        const mandatoryQuickSettings = Object.keys(quickSettingLabelRenames).filter(k => entry.data.quickSettings.hasOwnProperty(k));
        const miscQuickSettings = Object.keys(entry.data.quickSettings).filter(k => mandatoryQuickSettings.indexOf(k) == -1);

        function createQuickSetting(label: string, settingPath: string): HTMLElement{
            const quickSettingParameter = sm.createInspectorParameter(label, entry.data.quickSettings[settingPath], () => sm.applyQuickParameters(entry.data.quickSettings, settingPath));
            
            if(sm.componentMap.hasOwnProperty(settingPath)){
                quickSettingParameter.dataset['valueDiff'] = (sm.componentMap[settingPath].entries[0].component.instance.$$.ctx[0] == entry.data.quickSettings[settingPath] ? 'same' : 'changed');
            }
            else{
                quickSettingParameter.dataset['valueDiff'] = 'missing';
            }

            quickSettingsContainer.appendChild(quickSettingParameter);
    
            return quickSettingParameter;
        }

        const quickSettingsContainer = sm.createElementWithClassList('div', 'sd-webui-sm-inspector-category-content');

        for(let settingName of mandatoryQuickSettings){
            const quickSettingParameter = createQuickSetting(quickSettingLabelRenames[settingName], settingName);
            
            if(settingName == 'sd_model_checkpoint'){
                const valueField: HTMLElement = quickSettingParameter.querySelector('.param-value')!;
                const checkpointHash = valueField.innerText.match(/\[[a-f0-9]+\]/g);
                valueField.innerText = valueField.innerText.replace(/\.safetensors|\.ckpt|\[[a-f0-9]+\]/g, '');
                valueField.appendChild(sm.createElementWithInnerTextAndClassList('span', checkpointHash, 'hash'));
            }
        }
        
        for(let settingName of miscQuickSettings){
            createQuickSetting(settingName, settingName);
        }

        sm.inspector.appendChild(sm.createInspectorSettingsAccordion('Quick settings', quickSettingsContainer));

        const savedComponentSettings = sm.utils.unflattenSettingsMap(entry.data.componentSettings);
        const savedComponentDefaults = sm.utils.unflattenSettingsMap(sm.memoryStorage.savedDefaults[entry.data.defaults]);

        let curatedSettingNames = new Set<string>(); // Added manually to Generation accordion e.g.

        // A curated section that displays the core generation params, whether they differ or not
        const generationSettingsContent = sm.createElementWithClassList('div', 'sd-webui-sm-inspector-category-content');

        function getSavedValue(settingPath: string): any{
            return entry.data.componentSettings.hasOwnProperty(settingPath) ? entry.data.componentSettings[settingPath] : sm.memoryStorage.savedDefaults[entry.data.defaults][settingPath];
        }

        function createCompositeInspectorParameter(label: string, displayValueFormatter: (valueMap: {[key: string]: any}) => string, settingPaths: string[]): HTMLElement{
            settingPaths.forEach(curatedSettingNames.add.bind(curatedSettingNames));

            const valueMap = settingPaths.reduce((values, settingPath) => {values[settingPath] = getSavedValue(settingPath); return values;}, {});
            const param = sm.createInspectorParameter(label, displayValueFormatter(valueMap), () => sm.applyComponentSettings(valueMap), () => sm.setValueDiffAttribute(param, ...Object.keys(valueMap).map(p => ({path: p, value: valueMap[p]}))));

            param.update();
            
            return param;
        }

        function _createGenerationInspectorParameter(label: string, settingPath: string, factory: (label: string, settingPath: string, onUse: (settings: any) => void, onUIUpdate: () => void) => InspectorParameter): HTMLElement{
            curatedSettingNames.add(settingPath);

            const value = getSavedValue(settingPath);
            const parameter = factory(label, value, () => sm.applyComponentSettings({[settingPath]: value}), () => sm.setValueDiffAttribute(parameter, {path: settingPath, value: value}));

            parameter.update();

            return parameter;
        }

        function createGenerationInspectorPromptParameter(label: string, settingPath: string): HTMLElement{
            return _createGenerationInspectorParameter(label, settingPath, sm.createInspectorPromptSection);
        }

        function createGenerationInspectorParameter(label: string, settingPath: string): HTMLElement{
            return _createGenerationInspectorParameter(label, settingPath, sm.createInspectorParameter);
        }

        const getRootSettingName = (settingName: string): string => `${entry.data.type}/${settingName}`;
        const getScriptSettingName = (scriptName: string, settingName: string): string => `customscript/${scriptName}.py/${entry.data.type}/${settingName}`;

        generationSettingsContent.appendChild(createGenerationInspectorPromptParameter('Prompt', getRootSettingName('Prompt')));
        generationSettingsContent.appendChild(createGenerationInspectorPromptParameter('Negative prompt', getRootSettingName('Negative prompt')));
        
        generationSettingsContent.appendChild(createCompositeInspectorParameter("Sampling", valueMap => `${valueMap[getRootSettingName('Sampling method')]} (${valueMap[getRootSettingName('Sampling steps')]} steps)`, [getRootSettingName('Sampling method'), getRootSettingName('Sampling steps')]));
        generationSettingsContent.appendChild(createCompositeInspectorParameter("Size", valueMap => `${valueMap[getRootSettingName('Width')]} x ${valueMap[getRootSettingName('Height')]}`, [getRootSettingName('Width'), getRootSettingName('Height')]));
        generationSettingsContent.appendChild(createCompositeInspectorParameter("Batches", valueMap => `${valueMap[getRootSettingName('Batch count')]} x ${valueMap[getRootSettingName('Batch size')]}`, [getRootSettingName('Batch count'), getRootSettingName('Batch size')]));
        
        generationSettingsContent.appendChild(createGenerationInspectorParameter("CFG Scale", getRootSettingName('CFG Scale')));
        generationSettingsContent.appendChild(createGenerationInspectorParameter("Seed", getScriptSettingName('seed', 'Seed')));
        generationSettingsContent.appendChild(createGenerationInspectorParameter("Use subseed", getScriptSettingName('seed', 'Extra')));

        const hasSubseed = getSavedValue(getScriptSettingName('seed', 'Extra'));

        if(hasSubseed){
            generationSettingsContent.appendChild(createGenerationInspectorParameter("Variation seed", getScriptSettingName('seed', 'Variation seed')));
            generationSettingsContent.appendChild(createGenerationInspectorParameter("Variation strength", getScriptSettingName('seed', 'Variation strength')));
            generationSettingsContent.appendChild(createCompositeInspectorParameter("Resize seed from size", valueMap => `${valueMap[getScriptSettingName('seed', 'Resize seed from width')]} x ${valueMap[getScriptSettingName('seed', 'Resize seed from height')]}`, [getScriptSettingName('seed', 'Resize seed from width'), getScriptSettingName('seed', 'Resize seed from height')]));
        }

        generationSettingsContent.appendChild(createGenerationInspectorParameter("Hires. fix", getRootSettingName('Hires. fix')));
        generationSettingsContent.appendChild(createGenerationInspectorParameter("Refiner", getScriptSettingName('refiner', 'Refiner')));
        
        sm.inspector.appendChild(sm.createInspectorSettingsAccordion('Generation', generationSettingsContent));

        const hasHiresFix = getSavedValue(getRootSettingName('Hires. fix'));
        const hasRefiner = getSavedValue(getScriptSettingName('refiner', 'Refiner'));

        if(hasHiresFix){
            const hiresFixSettingsContent = sm.createElementWithClassList('div', 'sd-webui-sm-inspector-category-content');

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

        if(hasRefiner){
            const refinersSettingsContent = sm.createElementWithClassList('div', 'sd-webui-sm-inspector-category-content');

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
        
        /*  merge the saved values (that are different from their associated defaults) *with* their defaults (forming a "target value"),
[]        but only when the resulting value is different from either [current UI value | current UI default]
        
                                                        |       / Target value \       |
        | Setting   | Current UI    | Current Default   | Saved default | Saved value  | Show  |
        ----------------------------------------------------------------------------------------
        | A         | 1             | 1                 | 1             | 7            | 7     |
        | B         | 1             | 1                 | 0             | 0            | 0     |
        | C         | 0             | 1                 | 0             | 0            | 0     |
        | D         | 1             | 0                 | 0             | 0            | 0     |
        | E         | 1             | 1                 | 0             | 1            | NO    |
        | F         | 0             | 0                 | 0             | 0            | NO    |
        */
       
       // Remove saved values if they're already used, or are equal to both the current UI *and* current default values
       let mergedComponentSettings = savedComponentSettings;
       
       for(const sectionName in mergedComponentSettings){
           const savedSettingNames = Object.keys(mergedComponentSettings[sectionName]);
           
           for(const settingName of savedSettingNames){
               const value = mergedComponentSettings[sectionName][settingName];
               const settingPath = sectionName.endsWith('.py') ? getScriptSettingName(sectionName.substring(0, sectionName.length - 3), settingName) : `${sectionName}/${settingName}`;
               
               if(curatedSettingNames.has(settingPath) ||
               (sm.componentMap.hasOwnProperty(settingPath) && sm.memoryStorage.currentDefault.contents.hasOwnProperty(settingPath) &&
               sm.componentMap[settingPath].entries.every(e => sm.utils.areLooselyEqualValue(value, e.component.props.value, sm.memoryStorage.currentDefault.contents[settingPath])))){
                   delete mergedComponentSettings[sectionName][settingName];
                }
            }
        }

        // Add saved default value if it differs from the current UI *or* current default values, but not if it's already shown elsewhere (or isn't xxx2img-related)
        for(const sectionName in savedComponentDefaults){
            mergedComponentSettings[sectionName] = mergedComponentSettings[sectionName] || {};
            
            for(const settingName in savedComponentDefaults[sectionName]){
                const settingPath = `${sectionName}/${settingName}`;

                if(curatedSettingNames.has(settingPath) || (settingPath.indexOf(`${entry.data.type}`) == -1)){
                    continue;
                }

                const settingPathInfo = sm.utils.getSettingPathInfo(settingPath);

                // if settingName not in savedComponentSettings,  then 
                if(!mergedComponentSettings[sectionName].hasOwnProperty(settingName)){
                    if(!sm.componentMap.hasOwnProperty(settingPathInfo.basePath)){ // possibly a rogue setting
                        continue;
                    }

                    const value = savedComponentDefaults[sectionName][settingName];
                    const mappedComponents = sm.componentMap[settingPathInfo.basePath].entries;

                    for(let i = 0; i < mappedComponents.length; i++){
                        const finalSettingName = mappedComponents.length == 1 ? settingName : `${settingName} ${i}`;

                        if(!sm.utils.areLooselyEqualValue(value, mappedComponents[i].component.props.value, sm.memoryStorage.currentDefault.contents[settingPathInfo.basePath])){
                            mergedComponentSettings[sectionName][finalSettingName] = value;
                        }
                    }
                }
            }

            if(Object.keys(mergedComponentSettings[sectionName]).length == 0){
                delete mergedComponentSettings[sectionName];
            }
        }

        for(const sectionName in mergedComponentSettings){
            let prettyLabelName = sectionName;

            prettyLabelName = sectionName.replace(/\.py$/g, '').replaceAll('_', ' ');
            prettyLabelName = prettyLabelName[0].toUpperCase() + prettyLabelName.slice(1);

            const sectionSettings = mergedComponentSettings[sectionName];
            const explicitSectionData = {};

            for(const settingPath in sectionSettings){
                explicitSectionData[`${sectionName}/${settingPath}`] = sectionSettings[settingPath];
            }

            sm.inspector.appendChild(sm.createInspectorSettingsAccordion(prettyLabelName, explicitSectionData));
        }
    }

    sm.setValueDiffAttribute = function(element: HTMLElement, ...settings: {path: string, value: any}[]): void{
        element.dataset['valueDiff'] = 'same';

        for(const setting of settings){
            const settingPathInfo = sm.utils.getSettingPathInfo(setting.path);

            if(sm.componentMap.hasOwnProperty(settingPathInfo.basePath)){
                if(sm.componentMap[settingPathInfo.basePath].entries[settingPathInfo.index].component.props.value != setting.value){
                    element.dataset['valueDiff'] =  'changed';
                    break;
                }
            }
            else{
                element.dataset['valueDiff'] = 'missing';
                break;
            }
        }
    }

    sm.applyQuickParameters = async function(values: {[path: string]: any}, ...filter: string[]): Promise<void>{
        if(filter.length > 0){
            values = sm.utils.getFilteredObject(values, ...filter);
        }

        return sm.api.post("quicksettings", {contents: JSON.stringify(values)})
        .then(response => {
            if(!sm.utils.isValidResponse(response, 'success') || !response.success){
                Promise.reject(response);
                return;
            }

            sm.applyComponentSettings(values);
        })
        .catch(e => sm.utils.logResponseError("[State Manager] Applying quicksettings failed with error", e));
    }

    sm.applyComponentSettings = function(settings: {[path: string]: any}): void{
        for(let componentPath of Object.keys(settings)){
            const settingPathInfo = sm.utils.getSettingPathInfo(componentPath);
            
            const componentData = sm.componentMap[settingPathInfo.basePath];

            if(!componentData){
                console.warn(`[State Manager] Could not apply component path ${settingPathInfo.basePath}`);
                continue;
            }

            componentData.entries[settingPathInfo.index].component.props.value = settings[componentPath];
            componentData.entries[settingPathInfo.index].component.instance.$set({value: componentData.entries[settingPathInfo.index].component.props.value});

            const e = new Event("change", {bubbles: true});
            Object.defineProperty(e, "target", {value: componentData.entries[settingPathInfo.index].element});
            componentData.entries[settingPathInfo.index].element.dispatchEvent(e);
        }
    }

    sm.createInspectorSettingsAccordion = function(label: string, data: {[settingPath: string]: any} | HTMLElement): HTMLElement{
        const accordion = sm.createElementWithClassList('div', 'sd-webui-sm-inspector-category', 'block', 'gradio-accordion');
        
        accordion.appendChild(sm.createInspectorLabel(label));
        accordion.appendChild(sm.createElementWithInnerTextAndClassList('span', '▼', 'foldout'))
        
        let content = data;

        if(!(data instanceof HTMLElement)){
            content = sm.createElementWithClassList('div', 'sd-webui-sm-inspector-category-content');

            for(const settingPath in data){
                const parameter = sm.createInspectorParameter(settingPath.split('/').slice(1).join('/'), data[settingPath], () => {
                    sm.applyComponentSettings({[settingPath]: data[settingPath]});
                });

                sm.setValueDiffAttribute(parameter, {path: settingPath, value: data[settingPath]});
                content.appendChild(parameter);
            }
        }

        const applyButton = sm.createElementWithInnerTextAndClassList('button', `Load ${label}${label.toLowerCase().endsWith('settings') ? '' : ' settings'}`, 'sd-webui-sm-inspector-wide-button', 'sd-webui-sm-inspector-load-button');
        content.appendChild(applyButton);

        applyButton.addEventListener('click', e => {
            for(const param of applyButton.parentNode.querySelectorAll('.sd-webui-sm-inspector-param:has(:checked)')){
                param.apply();
            }

            e.stopPropagation();
            e.preventDefault();
        });
        
        content.style.height = '0';
        accordion.appendChild(content);

        accordion.addEventListener('click', () => {
            if(content.style.height == '100%'){
                content.style.height = '0';
                accordion.classList.remove('open');
            }
            else{
                content.style.height = '100%';
                accordion.classList.add('open');
            }

            //
        });

        return accordion;
    }

    sm.createInspectorPromptSection = function(label: string, prompt: string, onUse: () => void, onUIUpdate: () => void){
        const promptContainer = sm.createElementWithClassList('div', 'prompt-container', 'sd-webui-sm-inspector-param', sm.svelteClasses.prompt);
        promptContainer.apply = onUse;
        promptContainer.update = onUIUpdate;
        
        const promptField = sm.createElementWithInnerTextAndClassList('textarea', prompt, 'prompt');
        promptField.readOnly = true;

        const promptButtons = sm.createElementWithClassList('div', 'prompt-button-container');
        
        // const viewPromptButton = sm.createElementWithInnerTextAndClassList('button', '👁'); // todo: bring this back?
        // viewPromptButton.title = "View prompt";
        
        promptButtons.appendChild(sm.createUseButton(onUse));
        promptButtons.appendChild(sm.createCopyButton(prompt));
        // promptButtons.appendChild(viewPromptButton);

        promptContainer.appendChild(sm.createInspectorLabel(label));
        promptContainer.appendChild(promptField);
        promptContainer.appendChild(promptButtons);

        promptContainer.addEventListener('click', e => e.stopPropagation());

        return promptContainer;
    }

    sm.createInspectorParameterSection = function(value: any, onUse: () => void){
        const paramContainer = sm.createElementWithClassList('div', 'param-container');

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

        paramContainer.apply = onUse;

        return paramContainer;
    }

    sm.createInspectorSideButton = function(innerText: string, title: string, onClick: () => void){
        const button = sm.createElementWithInnerTextAndClassList('button', innerText);
        button.title = title;
        button.addEventListener('click', e => {
            onClick();
            e.stopPropagation();
        });

        return button;
    }

    sm.createUseButton = function(onUse: () => void){
        return sm.createInspectorSideButton('↙️', "Apply to prompt (overrides current)", onUse); //alt 📋, ↙️, 🔖, or 🗳
    }

    sm.createCopyButton = function(value: any){
        return sm.createInspectorSideButton('📄', "Copy to clipboard", () => navigator.clipboard.writeText(value.toString())); //alt 📋
    }

    sm.createInspectorLabel = function(label: string): HTMLElement{
        const labelWithCheckbox = sm.createElementWithClassList('span', 'label-container');

        const checkbox = sm.createElementWithClassList('input', 'param-checkbox', sm.svelteClasses.checkbox);
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        checkbox.addEventListener('click', e => e.stopPropagation());
        labelWithCheckbox.appendChild(checkbox);

        labelWithCheckbox.appendChild(sm.createElementWithInnerTextAndClassList('span', label, 'label'));

        return labelWithCheckbox;
    }

    sm.createInspectorParameter = function(label: string, value: any, onUse: () => void, onUIUpdate: () => void): HTMLElement{
        const paramContainer = sm.createElementWithClassList('div', 'sd-webui-sm-inspector-param');
        paramContainer.apply = onUse;
        paramContainer.update = onUIUpdate;

        paramContainer.appendChild(sm.createInspectorLabel(label));
        paramContainer.appendChild(sm.createInspectorParameterSection(value, onUse));

        return paramContainer;
    }
    
    sm.getGalleryPreviews = function(){
        return gradioApp().querySelectorAll('div[id^="tab_"] div[id$="_results"] .thumbnail-item > img');
    }
    
    sm.getCurrentState = async function(type: GenerationType): Promise<State>{ //type = txt2img or img2img
        return {
            saveVersion: sm.version,
            type: type, // txt2img | img2img
            defaults: sm.memoryStorage.currentDefault.hash,
            quickSettings: await sm.getQuickSettings(),
            componentSettings: sm.getComponentSettings(type, true),
            preview: sm.createPreviewImageData()
        };
    }
    
    sm.saveState = function(state: State, group: Group){
        state.createdAt = Date.now();
        state.groups = [group];
        
        sm.memoryStorage.entries.data[state.createdAt] = state;
        sm.memoryStorage.entries.updateKeys();
    
        sm.updateStorage();
    }

    sm.deleteStates = function(requireConfirmation, ...stateKeys): void{
        if(requireConfirmation && confirm(`Delete ${stateKeys.length} item${stateKeys.length == 1 ? '' : 's'}? This action cannot be undone.`)){
            for(const key of stateKeys){
                delete sm.memoryStorage.entries.data[key];
            }

            sm.memoryStorage.entries.updateKeys();
            sm.updateStorage();
        }
    }

    sm.addStateToGroup = function(stateKey: number, group: Group): void{
        let state = sm.memoryStorage.entries.data[stateKey];

        state.groups = state.groups || [group];

        if(state.groups.indexOf(group) == -1){
            state.groups.push(group);
        }

        sm.updateStorage();
    }
    
    sm.removeStateFromGroup = function(stateKey: number, group: Group): void{
        let state = sm.memoryStorage.entries.data[stateKey];

        if(!('groups' in state) || !state.groups){
            return;
        }

        const groupIndex = state.groups.indexOf(group);

        if(groupIndex > -1){ // It was in this group
            state.groups.splice(groupIndex, 1);

            if(state.groups.length == 0){
                delete sm.memoryStorage.entries.data[stateKey];
                sm.memoryStorage.entries.updateKeys();
            }
        }

        sm.updateStorage();
    }

    sm.setStateName = function(stateKey: number, name: string): void{
        sm.memoryStorage.entries.data[stateKey].name = name;

        sm.updateStorage();
    }

    sm.buildComponentMap = async function(): Promise<void>{
        return sm.api.get("componentids")
        .then(response => {
            if(!sm.utils.isValidResponse(response)){
                Promise.reject(response);
                return;
            }

            sm.componentMap = {};

            for(const path in response) { // {path: id}
                const component = gradio_config.components.find(c => c.id == response[path]);
                const pathParts = path.split('/');

                if(pathParts[pathParts.length - 1] != 'value'){
                    continue; // Skip other settings like min/max if they sneak in here
                }

                let data: MappedComponentData = {
                    entries: [{
                        component: component,
                        element: app.getElementById(component.props.elem_id || `component-${component.id}`)
                    }]
                }

                // I really, REALLY dislike adding exception cases for specific extensions, but ControlNet's such a pivotal one...
                // The problem is each unit refers to the same default component path, and we only get returned unit 0 in the list of mapped components from Py
                if(component.props.elem_id?.indexOf('controlnet_ControlNet-0_') > -1){
                    for(let i = 1; i < 3; i++){
                        const unitElemId = component.props.elem_id.replace('ControlNet-0_', `ControlNet-${i}_`);

                        data.entries.push({
                            component: gradio_config.components.find(c => c.props.elem_id == unitElemId),
                            element: app.getElementById(unitElemId)
                        });
                    }
                }

                sm.componentMap[pathParts.slice(0, pathParts.length - 1).join('/')] = data;
            }

            // Input accordions extend from gr.Checkbox, where an opened accordion = enabled and closed = disabled
            // They also contain a separate checkbox to override this behaviour, called `xxx-visible-checkbox`
            // To make matters worse, the refiner is just called `txt2img_enable`, and doesn't add itself to the monitored components
            // Since there's no way to retrieve the refiner property path from the accordion, I'm just gonna manually hack those in for now
            const inputAccordions = document.querySelectorAll('#tab_txt2img .input-accordion, #tab_img2img .input-accordion');

            for(const accordion of inputAccordions){
                const component = gradio_config.components.find(c => c.props.elem_id == accordion.id);
                const checkbox: HTMLInputElement | null = <HTMLInputElement>accordion.parentElement!.querySelector(`#${accordion.id}-checkbox`);
                const visibleCheckbox: HTMLInputElement | null = <HTMLInputElement>accordion.parentElement!.querySelector(`#${accordion.id}-visible-checkbox`);

                if(!checkbox || !visibleCheckbox){
                    console.warn(`[State Manager] An input accordion with an unexpected layout or naming was found (id: ${accordion.id})`);
                    continue;
                }

                let data: MappedComponentData = sm.componentMap[`${accordion.id.split('_')[0]}/${component.label}`];

                if(!data){
                    data = {
                        entries: [{
                            component: component,
                            element: checkbox
                        }]
                    };

                    switch(accordion.id){
                        case 'txt2img_enable':  sm.componentMap['customscript/refiner.py/txt2img/Refiner'] = data;  break;
                        case 'img2img_enable':  sm.componentMap['customscript/refiner.py/img2img/Refiner'] = data;  break;
                    }
                }

                // We could use data.element.addEventListener("change", ...) here, but I don't like the idea of adding a "global" listener
                // like that, that extends outside the scope of this extension. Thus, a hacky data.onchange() that we call manually. Neat.
                data.onChange = () => {
                    visibleCheckbox.checked = (<HTMLInputElement>data.entries[0].element).checked;
                };
            }

            const settingComponents = gradio_config.components.filter(c => c.props.elem_id?.startsWith('setting_'));

            for(const component of settingComponents) { // {path: id}
                let data: MappedComponentData = {
                    entries: [{
                        component: component,
                        element: app.getElementById(component.props.elem_id)
                    }]
                }
                
                sm.componentMap[component.props.elem_id.substring(8)] = data; // strips "setting_" so we get sm.componentMap['sd_model_checkpoint'] e.g.
            }
        })
        .catch(e => sm.utils.logResponseError("[State Manager] Getting component IDs failed with error", e));
    }

    sm.getFromStorage = async function(): Promise<StoredData>{
        return sm.api.get("savelocation")
        .then(response => {
            if(!sm.utils.isValidResponse(response, 'location')){
                Promise.reject(response);
                return;
            }
            
            if(response.location == 'File'){
                return sm.getFileStorage();
            }
            else{
                return sm.getLocalStorage();
            }
        })
        .then(sm.processStorageData)
        .catch(e => sm.utils.logResponseError("[State Manager] Getting storage failed with error", e));
    }

    sm.processStorageData = async function(storedData): Promise<StoredData>{
        if(sm.utils.isEmptyObject(storedData) || storedData == ""){
            return {
                defaults: {},
                entries: {}
            };
        }

        let bytes = storedData;

        if(!(storedData instanceof Uint8Array)){ // Data is in "legacy" SM 1.0 format
            bytes = Uint8Array.from(JSON.parse(storedData));
        }

        const decompressed = await sm.utils.decompress(bytes);
        
        return JSON.parse(decompressed) || {
            defaults: {},
            entries: {}
        };
    }

    sm.getLocalStorage = async function(): Promise<StoredData>{
        const promise: Promise<StoredData> = new Promise(function(resolve, _reject){
            sm.ldb.get('sd-webui-state-manager-data', storedData => { //ldb.get is asynchronous with callbacks, so we promisify it here
                if(storedData == null || storedData == '[]' || storedData == ''){
                    storedData = {};
                }
    
                resolve(storedData);
            });
        });

        return promise;
    }

    sm.getFileStorage = async function(): Promise<StoredData>{
        return sm.api.get("filedata")
        .then(response => {
            if(!sm.utils.isValidResponse(response, 'data')){
                Promise.reject(response);
            }
            else{
                return response.data || {
                    defaults: {},
                    entries: {}
                };
            }
        })
        .catch(e => sm.utils.logResponseError("[State Manager] Getting file storage failed with error", e));
    }

    sm.updateStorage = async function(): Promise<void>{
        sm.api.get("savelocation")
        .then(response => {
            if(!sm.utils.isValidResponse(response, 'location')){
                Promise.reject(response);
            }
            else if(response.location == 'File'){
                sm.updateFileStorage();
            }
            else{
                sm.updateLocalStorage();
            }
        })
        .catch(e => sm.utils.logResponseError("[State Manager] Updating storage failed with error", e));
    }

    sm.updateLocalStorage = async function(compressedData: Uint8Array): Promise<void>{
        if(compressedData == undefined){
            compressedData = await sm.getCompressedMemoryStorage();
        }
        
        sm.ldb.set('sd-webui-state-manager-data', compressedData);
    }

    sm.updateFileStorage = async function(compressedData: Uint8Array): Promise<void>{
        if(compressedData == undefined){
            compressedData = await sm.getCompressedMemoryStorage();
        }
        
        let payloadStringifiedArray = JSON.stringify(Array.from(compressedData));

        return sm.api.post("save", {contents: payloadStringifiedArray.substring(1, payloadStringifiedArray.length - 1)})
        .catch(e => sm.utils.logResponseError("[State Manager] Saving to file storage failed with error", e));
    }

    sm.getCompressedMemoryStorage = async function(): Promise<Uint8Array>{
        // We compress the raw JSON using gzip and store that.
        // I couldn't be bothered to test this with real-world data, but I *strongly* suspect this is a more space-efficient way
        // due to the great amounts of repetition in entry strings (such as 'SDE++ 2M Karras' and `longCheckpointMixNameV1.23 [3942ab99c]` e.g.)
        const compressed = await sm.utils.compress(JSON.stringify({
            defaults: sm.memoryStorage.savedDefaults,
            entries: sm.memoryStorage.entries.data
        }));
        
        return compressed;
    }

    sm.initMemoryStorage = async function(storedData: StoredData){
        if(!storedData.hasOwnProperty('defaults')){
            sm.legacyData = storedData;
            return;
        }

        sm.memoryStorage = {
            currentDefault: null,
            savedDefaults: storedData.defaults || {},
            entries: {
                data: storedData.entries || {},
                orderedKeys: [],
                updateKeys: function(){
                    sm.memoryStorage.entries.orderedKeys = Object.keys(sm.memoryStorage.entries.data);
                    sm.memoryStorage.entries.orderedKeys.sort().reverse();
                }
            }
        };
        
        sm.memoryStorage.entries.updateKeys();
        
        // Load default UI settings
        // sm.inspector.innerHTML = "Loading current UI defaults...";
        
        return sm.api.get("uidefaults")
        .then(response => {
            if(!sm.utils.isValidResponse(response, 'hash', 'contents')){
                Promise.reject(response);
                return;
            }

            let contents = {};

            for(const path of Object.keys(response.contents)){
                const pathParts = path.split('/');

                if(pathParts[pathParts.length - 1] != 'value'){
                    continue; // Skip other settings like min/max if they sneak in here
                }

                contents[pathParts.slice(0, pathParts.length - 1).join('/')] = response.contents[path];
            }

            const currentDefault = {
                hash: response.hash,
                contents: contents
            };
            
            sm.memoryStorage.currentDefault = currentDefault;
            sm.memoryStorage.savedDefaults[currentDefault.hash] = contents;
            // sm.inspector.innerHTML = "";
            
            // sm.updateInspector();
        })
        .catch(e => {
            // sm.inspector.innerHTML = "There was an error loading current UI defaults. Please reload the UI (refresh the page).";
            sm.utils.logResponseError("[State Manager] Getting UI defaults failed with error", e);
        });
    }

    sm.syncStorage = function(direction, type){
        return sm.api.get("savelocation")
        .then(response => {
            if(!sm.utils.isValidResponse(response, 'saveFile')){
                Promise.reject(response);
                return;
            }

            const sources = ["this browser's Indexed DB", `the shared ${response.saveFile} file`];
            const warning = type == 'merge' ?
                `merge the entries of both ${sources[0]} and ${sources[1]}, and write the result to ${direction == 'idb2file' ? "this file" : "the Indexed DB"}` :
                `override the entries of ${sources[direction == 'idb2file' ? 1 : 0]} with the contents of ${sources[direction == 'idb2file' ? 0 : 1]}`;

            if(!confirm(`You are about to ${warning}. This operation can not be undone! Are you sure you wish to continue?`)){
                return;
            }

            (direction == 'idb2file' ? sm.getLocalStorage() : sm.getFileStorage())
            .then(d => {
                return sm.processStorageData(d);
            })
            .then(sourceData => {
                if(type == 'overwrite'){
                    return sourceData;
                }
                else{
                    (direction == 'idb2file' ? sm.getFileStorage() : sm.getLocalStorage())
                    .then(sm.processStorageData)
                    .then(destinationData => {
                        Object.assign(destinationData, sourceData);
                        
                        return destinationData;
                    })
                    .catch(e => sm.utils.logResponseError("[State Manager] Could not merge data", e));
                }
            })
            .then(destinationData => {
                return sm.utils.compress(JSON.stringify(destinationData));
            })
            .then(compressedDestinationData => {
                if(direction == 'idb2file'){
                    sm.updateFileStorage(compressedDestinationData);
                }
                else{
                    sm.updateLocalStorage(compressedDestinationData);
                }
            })
            .catch(e => sm.utils.logResponseError("[State Manager] Could not sync data", e));
        })
        .catch(e => sm.utils.logResponseError("[State Manager] Getting save file name failed with error", e));
    }

    sm.getStateData = function(group: Group | 'all'): State[]{
        let result: State[] = [];

        for(let key of sm.memoryStorage.entries.orderedKeys){
            const data = sm.memoryStorage.entries.data[key];

            if(!group || group == 'all' || ((data.groups?.indexOf(group) ?? -1) > -1)){
                result.push(data);
            }
        }

        return result;
    }

    sm.clearHistory = function(): void{
        if(!confirm(`Warning! You are about to delete all entries that are not favourited and do not have a name. This operation can not be undone! Are you sure you wish to continue?`)){
            return;
        }
        
        for(const key of sm.memoryStorage.entries.orderedKeys){
            const data = sm.memoryStorage.entries.data[key];

            if(!data.groups || (data.groups.length == 1 && data.groups[0] == 'history' && (!data.hasOwnProperty('name') || data.name == ''))){
                delete sm.memoryStorage.entries.data[key];
            }
        }

        sm.memoryStorage.entries.updateKeys();
        sm.updateStorage();
    }

    sm.clearData = function(location: SaveLocation): void{
        sm.api.get("savelocation")
        .then(response => {
            if(!sm.utils.isValidResponse(response, 'location', 'saveFile')){
                Promise.reject(response);
                return;
            }

            const sources = ["this browser's Indexed DB", `the shared ${response.saveFile} file`];

            if(!confirm(`Warning! You are about to delete ALL entries from ${sources[location == 'Browser\'s Indexed DB' ? 0 : 1]}. This operation can not be undone! Are you sure you wish to continue?`)){
                return;
            }

            function ensureMemoryStorageIsSynced(){
                if(response.location == location){
                    sm.initMemoryStorage({});
                    sm.updateEntries();
                }
            }

            if(location == 'File'){
                sm.updateFileStorage([])
                .then(() => {
                    console.log("[State Manager] Succesfully deleted all File entries");
                    sm.api.post("showmodal", {type: 'info', contents: `${response.saveFile} has been cleared`});
                    ensureMemoryStorageIsSynced();
                })
                .catch(e => sm.utils.logResponseError("[State Manager] Clearing File entries failed with error", e));
            }
            else{
                sm.updateLocalStorage([]);
                console.log("[State Manager] Succesfully deleted all IDB entries");
                sm.api.post("showmodal", {type: 'info', contents: "IDB has been cleared"});
                ensureMemoryStorageIsSynced();
            }
        })
        .catch(e => sm.utils.logResponseError("[State Manager] Getting save file name failed with error", e));
    }

    sm.applyAll = function(state: State){
        sm.applyQuickParameters(state.quickSettings); // The 4 mandatory ones always get saved, any other relevant ones will be in here. Easy!

        const savedComponentDefaults = sm.memoryStorage.savedDefaults[state.defaults];
        let mergedComponentSettings = state.componentSettings;

        // Add saved default value if it differs from the current UI
        for(const settingPath in savedComponentDefaults){
            if(settingPath.indexOf(state.type) == -1){
                continue;
            }
            
            if(!mergedComponentSettings.hasOwnProperty(settingPath)){
                if(!sm.componentMap.hasOwnProperty(settingPath)){ // rogue setting
                    continue;
                }
                
                const value = savedComponentDefaults[settingPath];

                const mappedComponents = sm.componentMap[settingPath].entries;

                for(let i=0; i < mappedComponents.length; i++){
                    if(!sm.utils.areLooselyEqualValue(value, mappedComponents[i].component.props.value)){
                        mergedComponentSettings[mappedComponents.length == 1 ? settingPath : `${settingPath}/${i}`] = value;
                    }
                }
            }
        }

        sm.applyComponentSettings(mergedComponentSettings);
    }

    sm.getQuickSettings = async function(): Promise<{[opt: string]: any}>{
        return sm.api.get("quicksettings")
        .then(response => {
            if(!sm.utils.isValidResponse(response, 'settings')){
                Promise.reject(response);
            }
            
            return response.settings;
        })
        .catch(e => sm.utils.logResponseError("[State Manager] Getting State Manager version failed with error", e));
    }

    sm.getComponentSettings = function(type: GenerationType, changedOnly = true): {[path: string]: any}{
        let settings = {};
        // let noComponentFoundSettings: string[] = [];

        for(const componentPath of Object.keys(sm.memoryStorage.currentDefault.contents)){
            const componentData = sm.componentMap[componentPath];

            if(!componentData){
                // noComponentFoundSettings.push(componentPath);
                continue;
            }

            
            const reType = new RegExp(`(^|\/)${type}/`);
                
            if(reType.test(componentPath)){
                for(let i = 0; i < componentData.entries.length; i++){
                    const finalComponentPath = componentData.entries.length == 1 ? componentPath : `${componentPath}/${i}`;
                    const currentValue = componentData.entries[i].component.props.value;

                    if(!changedOnly || (sm.memoryStorage.currentDefault.contents[finalComponentPath] != currentValue)){
                        settings[finalComponentPath] = currentValue;
                    }
                }   
            }
        }

        return settings;
    }
    
    sm.createPreviewImageData = function(): string | null{
        if(!sm.lastHeadImage){
            return null;
        }
    
        const galleryPreviews = sm.getGalleryPreviews();
    
        const image = (galleryPreviews.length > 1 && galleryPreviews[0].src.includes("grids/")) ? galleryPreviews[1] : galleryPreviews[0];

        if(!image){
            return null;
        }
    
        // const imageSize = {x: 100, y: 100};
    
        const scale = 100 / Math.max(image.naturalWidth, image.naturalHeight);
    
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
      
        // Set width and height
        canvas.width = image.naturalWidth * scale;
        canvas.height = image.naturalHeight * scale;
      
        // Draw image and export to a data-uri
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        const dataURI = canvas.toDataURL();
    
        return dataURI;
    }
    
    sm.createElementWithClassList = function(tagName: string, ...classes: string[]): HTMLElement{
        const element = document.createElement(tagName);
    
        for(const className of classes) {
            element.classList.add(className);
        }
    
        return element;
    }

    sm.createElementWithInnerTextAndClassList = function(tagName: string, innerText: string, ...classes: string[]): HTMLElement{
        const element = sm.createElementWithClassList(tagName, ...classes);

        element.innerText = innerText;
    
        return element;
    }

    // Stolen from `notification.js`, but can't use same `headImg`. Really wish webui had more callbacks
    sm.checkHeadImage = function(): void{
        const galleryPreviews = sm.getGalleryPreviews();

        if (galleryPreviews == null) return;

        const headImage = galleryPreviews[0]?.src;

        if (headImage == null || headImage == sm.lastHeadImage) return;

        sm.lastHeadImage = headImage;

        if(sm.autoSaveHistory){
            sm.saveLastUsedState();
        }
    }

    sm.saveLastUsedState = function(): void{
        if(!sm.lastUsedState){
            alert("No previous state found.");
            return;
        }

        sm.lastUsedState.preview = sm.createPreviewImageData();
        
        const seedPath = `customscript/seed.py/${sm.lastUsedState.type}/Seed`;

        if(!sm.lastUsedState.componentSettings.hasOwnProperty(seedPath) || sm.lastUsedState.componentSettings[seedPath] == -1){ // Try and grab the actual seed used
            let seedFromHTMLInfo = Number(app.querySelector(`#html_info_${sm.lastUsedState.type} p`).innerText.match(/Seed: (\d+)/)[1]);
            const selectedThumbnail = app.querySelector(`#${sm.lastUsedState.type.type}_gallery .thumbnail-item.selected`);

            // If we've got thumbnail i selected, then 0 = grid (seed N), 1 = first image (seed N), 2 = second image (seed N+1), ...
            if(selectedThumbnail != undefined){
                const thumbnailIndex = Array.prototype.indexOf.call(selectedThumbnail.parentNode.children, selectedThumbnail);
                
                seedFromHTMLInfo -= Math.max(thumbnailIndex - 1, 0);
            }
            
            sm.lastUsedState.componentSettings[seedPath] = seedFromHTMLInfo;
        }

        sm.saveState(sm.lastUsedState, 'history');

        if(sm.entryFilter.group == 'history'){
            sm.updateEntries();
        }
    }

    sm.api = {
        get: endpoint => {
            return fetch(`${gradio_config.root}/statemanager/${endpoint}`).then(response => {
                if(response.ok){
                    return response.json();
                } else{
                    return Promise.reject(response);
                }
            });
        },
    
        post: (endpoint, payload) => {
            return fetch(`${gradio_config.root}/statemanager/${endpoint}`, {method: 'POST', headers: {'Accept': 'application/json', 'Content-Type': "application/json"}, body: JSON.stringify(payload)})
            .then(response => {
                if(response.ok){
                    return response.json();
                } else{
                    return Promise.reject(response);
                }
            });
        }
    }

    // Shamelessly yoinked from https://www.syncfusion.com/blogs/post/deep-compare-javascript-objects.aspx
    sm.utils = {
        // UI
        getCurrentGenerationTypeFromUI: (): GenerationType | null => {
            if(uiCurrentTab.innerText == 'txt2img' || uiCurrentTab.innerText == 'img2img'){
                return uiCurrentTab.innerText;
            }

            // In case of i18n e.g., we fall back to this
            if(app.getElementById("tab_txt2img").style.display == 'block'){
                return 'txt2img';
            }
            else if(app.getElementById("tab_img2img").style.display == 'block'){
                return 'img2img';
            }
            
            return null;
        },

        areLooselyEqualValue: (...values: any[]): boolean => {
            const qualifiesForLooseComparison = looselyEqualUIValues.has(values[0]);
            return values.reduce((isEqual, value) => isEqual && (value == values[0] || sm.utils.isDeepEqual(value, values[0]) || (qualifiesForLooseComparison && looselyEqualUIValues.has(value))), true);
        },

        // Objects
        isDeepEqual: (object1, object2) => {
            if(!object1 || !object2){
                return false;
            }
            
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

        isObject: object => {
            return object != null && typeof object === "object";
        },

        isEmptyObject: object => {
            return sm.utils.isObject(object) && Object.keys(object).length == 0;
        },

        isValidResponse: (response, ...requiredProperties) => {
            return response && !sm.utils.isEmptyObject(response) && requiredProperties.every(p => response.hasOwnProperty(p));
        },

        logResponseError: async function(baseMessage, e){
            let err = "[No error received]";
            let errType = "unknown type";
            
            if(typeof e == 'string'){
                errType = "string";
                err = e;
            }
            else if(e instanceof Response){
                errType = "Response object";
                err = await e.text();
            }
            else {
                err = e;
            }

            console.error(`${baseMessage}: (${errType} error) ${err}`);
        },

        getSettingPathInfo: function(settingPath): SettingPathInfo{ // strip /1 /2 etc from the end, in case it's a multi-component setting (i.e.: controlnet is stored as txt2img/Control Mode/1)
            const index = Number(settingPath.match(/\/(\d+)$/)?.[1] || 0);

            return {
                basePath: settingPath.replace(/\/\d+$/, ''),
                index: index,
            }
        },

        unflattenSettingsMap: function(settings){ // Convert 'txt2img/foo/bar` to {txt2img: {foo/bar: value}}
            const settingPaths = Object.keys(settings);
            let settingsMap = {};

            for(const path of settingPaths){
                const pathParts = path.split('/');
                const sliceEnd = pathParts[pathParts.length - 1] == 'value' ? -1 : pathParts.length;
                
                if(pathParts[0] == 'customscript'){ // customscript/seed.py/txt2img/Seed/value e.g.
                    settingsMap[pathParts[1]] = settingsMap[pathParts[1]] || {};
                    settingsMap[pathParts[1]][pathParts.slice(3, sliceEnd).join('/')] = settings[path];
                }
                else{ // txt2img/prompt e.g.
                    settingsMap[pathParts[0]] = settingsMap[pathParts[0]] || {};
                    settingsMap[pathParts[0]][pathParts.slice(1, sliceEnd).join('/')] = settings[path];
                }
            }

            return settingsMap;
        },

        getFilteredObject: function(values: {[key: string]: any}, ...filter: string[]): {[key: string]: any}{
            if(filter.length > 0){
                values = Object.keys(values).reduce((newValues, path) => {
                    if(filter.indexOf(path) > -1){
                        newValues[path] = values[path];
                    }
                    return newValues;
                  }, {});
            }

            return values;
        },

        // GZIP compression https://evanhahn.com/javascript-compression-streams-api-with-strings/
        compress: async function(str) {
            const stream = new Blob([str]).stream();
            const compressedStream = stream.pipeThrough(new CompressionStream("gzip"));
            const chunks: any[] = [];

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
            const chunks: any[] = [];
            
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

    sm.init = async function(): Promise<void>{
        await sm.api.get("version")
        .then(response => {
            if(!sm.utils.isValidResponse(response, 'version')){
                Promise.reject(response);
            }
            
            sm.version = response.version;
        })
        .catch(e => sm.utils.logResponseError("[State Manager] Getting State Manager version failed with error", e));

        await sm.getFromStorage()
        .then(async storedData => {
            await sm.initMemoryStorage(storedData);

            if(sm.hasOwnProperty('updateEntriesWhenStorageReady')){
                sm.updateEntries();
            }
        })
        .catch(e => sm.utils.logResponseError("[State Manager] Could not get data from storage", e));

        await sm.buildComponentMap();

        sm.injectUI();
    }

    onUiLoaded(sm.init);
    onAfterUiUpdate(sm.checkHeadImage);
})(window.stateManager = window.stateManager || {
    componentMap: {},
    memoryStorage: {
        currentDefault: null,
        savedDefaults: null,
        entries: {
            data: {},
            orderedKeys: [],
            updateKeys: () => {}
        }
    },
    selection: {
        rangeSelectStart: null,
        entries: [],
        undoableRangeSelectionAmount: 0,
        select: function (entry: Entry, type: SelectionType): void {
            switch(type){
                case 'single':
                    for(let e of this.entries){
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

                    if(entry.classList.contains('active')){
                        this.entries.push(entry);
                    }
                    else{
                        this.entries.splice(this.entries.indexOf(entry), 1);
                    }
                    break;
                case 'range':
                    if(this.rangeSelectStart == null){
                        this.select(entry, 'single');
                        return;
                    }

                    // unselect previous range select
                    const unselectedEntries = this.entries.splice(this.entries.length - this.undoableRangeSelectionAmount, this.undoableRangeSelectionAmount);

                    for(let i = 0; i < unselectedEntries.length; i++){
                        unselectedEntries[i].classList.remove('active');
                    }

                    if(entry == this.rangeSelectStart){
                        return;
                    }

                    // select new range
                    let rangeStartIndex = Array.prototype.indexOf.call(this.rangeSelectStart.parentNode.children, this.rangeSelectStart);
                    let rangeEndIndex = Array.prototype.indexOf.call(entry.parentNode!.children, entry);

                    function selectEntry(index){
                        const rangeEntry = <HTMLElement>entry.parentNode!.childNodes[index];
                        this.entries.push(rangeEntry);
                        rangeEntry.classList.add('active');
                    }

                    if(rangeStartIndex < rangeEndIndex){
                        for(let i = rangeStartIndex + 1; i <= rangeEndIndex; i++){
                            selectEntry(i);
                        }
    
                        this.undoableRangeSelectionAmount = rangeEndIndex - rangeStartIndex;// - 1;    
                    }
                    else{
                        for(let i = rangeStartIndex - 1; i >= rangeEndIndex; i--){
                            selectEntry(i);
                        }
    
                        this.undoableRangeSelectionAmount = rangeStartIndex - rangeEndIndex;// - 1;    
                    }
                    break;
            }

            window.stateManager.updateInspector();
        }
    }
});