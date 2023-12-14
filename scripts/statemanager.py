import contextlib

import gradio as gr
from modules import scripts
from modules import script_callbacks

def send_text_to_prompt(new_text, old_text):
    if old_text == "":  # if text on the textbox text2img or img2img is empty, return new text
        return new_text
    return old_text + " " + new_text  # else join them together and send it to the textbox

class ExampleScript(scripts.Script):
    def __init__(self) -> None:
        super().__init__()

    def title(self):
        return "Example"

    def show(self, is_img2img):
        return False