import gradio as gr
import modules.script_callbacks as script_callbacks

import json
import hashlib

from os import path
from typing import Annotated

from fastapi import FastAPI, Body
from pydantic import BaseModel

from modules import shared, scripts

class ContentsDataModel(BaseModel):
    contents: Annotated[str, Body(embed=True)]

class ModalMessageModel(BaseModel):
    type: str
    contents: str

settings_section = ('statemanager', "State Manager");
script_base_dir = scripts.basedir();
storage_file_path = path.join(script_base_dir, "history.txt")

# controlnet_components = []

def update_storage_file_path():
    global storage_file_path

    try:
        storage_file_path = path.join(script_base_dir, shared.opts.statemanager_save_file_location)
    except AttributeError:
        storage_file_path = path.join(script_base_dir, "history.txt")

    # with open(storage_file_path, 'a+') as f: # Just make sure it exists, create if not
    #     pass

# https://stackoverflow.com/questions/22058048/hashing-a-file-in-python
def sha256sum(filepath):
    h  = hashlib.sha256()
    b  = bytearray(128*1024)
    mv = memoryview(b)
    with open(filepath, 'rb', buffering=0) as f:
        while n := f.readinto(mv):
            h.update(mv[:n])
    return h.hexdigest()

def state_manager_api(blocks: gr.Blocks, app: FastAPI):
    @app.get("/statemanager/version")
    async def version():
        return {"version": "2.0-beta"}

    @app.get("/statemanager/componentids")
    async def get_component_ids():
        return {component_path: blocks.ui_loadsave.component_mapping[component_path]._id for component_path in blocks.ui_loadsave.component_mapping.keys()}
    
    @app.get("/statemanager/uidefaults")
    async def get_ui_defaults():
        filepath = path.join(scripts.basedir(), "ui-config.json")
                             
        with open(filepath, 'r', encoding='utf-8') as f:
            contents = json.load(f)
            
            return {
                "hash": sha256sum(filepath),
                "contents": {k: v for (k, v) in contents.items() if k.endswith("/value")} # We don't need /visible, /min, /max, etc.
            }
        
    @app.get("/statemanager/savelocation")
    async def get_save_location():
        return {
            "location": shared.opts.statemanager_save_location,
            "saveFile": shared.opts.statemanager_save_file_location
        }
    
    @app.get("/statemanager/filedata")
    async def get_file_data():
        with open(storage_file_path, 'rb') as f:
            raw = bytearray(f.read())

            return {"data": f"[{','.join(map(str, raw))}]" if len(raw) > 0 else None}

    @app.get("/statemanager/quicksettings")
    async def get_quick_settings():
        # Model, VAE, CLIP and hypernetwork are such important and commonly changed settings, I feel they belong here no matter what
        quick_settings_names = set(['sd_model_checkpoint', 'sd_vae', 'sd_hypernetwork', 'CLIP_stop_at_last_layers']).union(set(shared.opts.quicksettings_list))
        
        return {"settings": {s: getattr(shared.opts, s) for s in quick_settings_names}}
    
    @app.post("/statemanager/quicksettings")
    async def set_quick_settings(settings_json: ContentsDataModel):
        settings = json.loads(settings_json.contents)

        for name, value in settings.items():
            print(f'setting shared.opts.{name} to {value}')
            setattr(shared.opts, name, value)
        
        return {"success": True}

    # def save(contents: Annotated[str, Body()]):
    @app.post("/statemanager/save")
    def save(saveData: ContentsDataModel):
        saveData = bytes(bytearray(map(int, saveData.contents.split(','))))

        with open(storage_file_path, 'wb') as f:
            f.write(saveData)
        
        return {"success": True}
    
    @app.post("/statemanager/showmodal")
    def show_modal(message: ModalMessageModel):
        if message.type == 'info':
            gr.Info(message.contents)
        elif message.type == 'warning':
            gr.Warning(message.contents)
        else:
            gr.Error(message.contents)
        
        return {"success": True}

def on_ui_settings():
    options = {
        "statemanager_save_explanation": shared.OptionHTML("""
    State Manager 1.0 used to save entries exclusively to the browser's indexed DB. This means each browser – and each browser
    profile – has its own, unique history. Choosing 'File' will instead save the history to a file in this extension's root
    folder, and can be shared across all browsers and profiles.
    """),
        "statemanager_save_location": shared.OptionInfo("Browser's Indexed DB", "Save Location", gr.Radio, {"choices": ["File", "Browser's Indexed DB"]}).needs_reload_ui(),
        "statemanager_save_file_location": shared.OptionInfo("history.txt", "File name", onchange=update_storage_file_path).info("When saving to file, the name of the file to use. Change this is you want to maintain multiple, independent histories. AFTER CHANGING THIS, REMEMBER TO APPLY SETTINGS BEFORE USING ANY OF THE TOOLS BELOW!").needs_reload_ui(),
    }

    for name, opt in options.items():
        opt.section = settings_section
        shared.opts.add_option(name, opt)

def statemanager_option_button_component(py_click, js_click, **kwargs):
    class_list = "sd-webui-statemanager-option-button " + kwargs.pop('elem_classes', '')
    button = gr.Button(elem_classes=class_list, **kwargs)

    if str(gr.__version__[0]) == "3":
        button.click(fn=py_click, _js=js_click)
    else: #future-proofing
        button.click(fn=py_click, js=js_click)

    return button

class StateManagerOptionButton(shared.OptionInfo):
    def __init__(self, text, py_click, js_click, **kwargs):
        super().__init__(str(text).strip(), label='', component=lambda **lkwargs: statemanager_option_button_component(py_click, js_click, **{**kwargs, **lkwargs}))
        self.do_not_save = True

shared.options_templates.update(
    shared.options_section(
        settings_section, {
            "statemanager_idb2file_overwrite": StateManagerOptionButton('Copy Indexed DB to File (overwrite)', None, "stateManager.syncStorage('idb2file', 'overwrite')", variant="primary"),
            "statemanager_idb2file_merge": StateManagerOptionButton('Copy Indexed DB to File (merge)', None, "stateManager.syncStorage('idb2file', 'merge')", variant="primary"),
            "statemanager_file2idb_overwrite": StateManagerOptionButton('Copy File to Indexed DB (overwrite)', None, "stateManager.syncStorage('file2idb', 'overwrite')", variant="primary"),
            "statemanager_file2idb_merge": StateManagerOptionButton('Copy File to Indexed DB (merge)', None, "stateManager.syncStorage('file2idb', 'merge')", variant="primary"),
            "statemanager_idb_clear": StateManagerOptionButton('Delete all data from Indexed DB', None, "stateManager.clearData('Browser's Indexed DB')"),
            "statemanager_file_clear": StateManagerOptionButton('Delete all data from File', None, "stateManager.clearData('File')"),
            # "statemanager_update_components": StateManagerUpdateButton('INTERNAL COMPONENT UPDATE', test, [cached_map[comp_name] for comp_name in list(x for x in cached_map.values())], None, None),
            # "statemanager_export_idb": StateManagerOptionButton('Export Indexed DB to file', None, "stateManager.syncStorage('localStorage', true)"),
            # "statemanager_import_idb": StateManagerOptionButton('Copy Indexed DB to File (merge)', None, "stateManager.syncStorage('localStorage', true)"),
        }
    )
)

update_storage_file_path()

script_callbacks.on_app_started(state_manager_api)
script_callbacks.on_ui_settings(on_ui_settings)


# def on_after_component(component, **kwargs):
#     if 'elem_id' in kwargs:
#         elem_id = kwargs['elem_id']
#         if elem_id != None and 'controlnet' in elem_id:
#             controlnet_components.append(component)
#             print(f'Creating component with elem_id {kwargs["elem_id"]}')

# script_callbacks.on_after_component(on_after_component)