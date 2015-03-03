import sublime, sublime_plugin
import re
import json
import os
import subprocess
import threading
import _thread as thread
from time import time, sleep

IMBA_WARN_CACHE = []
IMBA_HINT_CACHE = {}

class ImbaEventTrigger(object):

	def __init__(self):
		self.time = time()
		self.reschedule = False
		self.running = False
		this = self
		self.handler = lambda: this.run_event()
	
	def delay(self,delay):
		if self.running == True:
			print("delay - is running - reschedule")
			self.reschedule = True
			self.time = time() * 1000 + delay
		else:
			print("set timeout now")
			self.running = True
			sublime.set_timeout_async(self.handler,delay)
		pass

	def run_event(self):
		self.running = False

		if self.reschedule == True:
			self.reschedule = False
			# schedule a new event after this
			delta = self.time - time() * 1000

			if delta > 100: # dont wait if it is a very small delta
				self.delay(delta) # using ms
				print("rescheduled" + str(delta))
				return

		print("local run_event")
		self.running = False
		self.run()
		pass

	def run(self):
		window = sublime.active_window()
		view = window.active_view() if window != None else None
		on_caret_hold(view)
		pass

IMBA_CARET_HOLD_HANDLER = ImbaEventTrigger()


class ImbaDocumentListener(sublime_plugin.EventListener):

	def log(self,str):
		print(str)
		pass

	def init_plugin():
		pass

	def ignore_event(self, view):
		"""
		Ignore request to highlight if the view is a widget,
		or if it is too soon to accept an event.
		"""

		syntax = view.settings().get('syntax')
		not_imba = syntax != "Packages/Imba/Imba.tmLanguage"
		# should ignore everything but imba files
		return (not_imba or view.settings().get('is_widget'))

	def on_modified(self, view):
		# print('document was modified')
		return

	def on_selection_modified_async(self,view):
		

		if self.ignore_event(view):
			return
		IMBA_CARET_HOLD_HANDLER.delay(1000)
		return

	# def on_text_command(self,view, cmd, args):
	# 	print("run command " + cmd)
	# 	if cmd == "commit_completion":
	# 		warn = view.get_status("hint.warning")
	# 		if warn:
	# 			print("cancel command!")
	# 			return ("noop",())
	# 	pass

	def on_post_save_async(self, view):
		self.log('document was saved')
		self.log(view.file_name())

		name, ext = os.path.splitext(view.file_name())

		if ext == '.imba':
			self.log('good file')
			data = self.get_annotations_for_view(view)
			self.log(json.dumps(data))
			show_annotations_for_view(view,data)
		else:
			self.log('dont do anything')

	def get_annotations_for_view(self, view):
		return get_annotations_for_file(view.file_name())


def add_error(view,message,region):
	options = sublime.PERSISTENT
	options |= sublime.DRAW_NO_OUTLINE
	options |= sublime.DRAW_SOLID_UNDERLINE
	print('add_error')
	view.add_regions("hint.errors",[region],"hint.warning","dot",options)
	pass

def add_reg(view,data,regions,name,style,options,icon = ""):
	data["regions"].append(name)
	view.add_regions(name,regions,style,icon,options)
	pass

def show_annotations_for_view(view,data):

	prev = get_cached_annotations_for_view(view) # IMBA_HINT_CACHE[str(view.id())] or {}

	if prev and "regions" in prev:
		for region in prev["regions"]:
			print("remove region from prev!")
			view.erase_regions(region)

	data["regions"] = []
	# add helper-class for different regions?
	# a class that wraps the format output by imba would be very helpful

	options = sublime.PERSISTENT
	icon = ""
	options |= sublime.DRAW_NO_OUTLINE
	options |= sublime.DRAW_SOLID_UNDERLINE
	style = "hint.var"

	class Regs:
  		var = []
  		err = []
  		warn = []


	# for now we just add them all to the same register
	regnr = 0
	scopes = []
	scope_opts = sublime.PERSISTENT

	# regions = []

	if "scopes" in data:
		for scope in data["scopes"]:
			level = scope.get("level",0)
			typ = scope.get("type","Scope")
			region = sublime.Region(scope["loc"][0],scope["loc"][1])
			scopes.append(region)


			for var in scope["vars"]:
				var_regions = []		
				for ref in var["refs"]:
					region = sublime.Region(ref["loc"][0],ref["loc"][1])
					var_regions.append(region)

				style = "hint.var" + "." + typ # + ".level" + str(level)
				add_reg(view,data,var_regions,str(regnr + 1),style,options)
				regnr = regnr + 1
				print (style)

				# Regs.var.extend(var_regions)
				# unique reference to this var?
			print (scope["type"])

	view.erase_regions("hint.var")
	# view.erase_regions("0")
	# view.erase_regions("1")
	# view.erase_regions("2")
	# view.erase_regions("3")

	# adding the variable regions
	# view.add_regions("hint.var",Regs.var,style,icon,options)

	# adding the scope regions
	# view.add_regions("hint.scopes",scopes,"hint.scopes","",scope_opts)

	# add warnings

	options = sublime.PERSISTENT
	options |= sublime.DRAW_NO_FILL
	options |= sublime.DRAW_NO_OUTLINE
	options |= sublime.DRAW_SOLID_UNDERLINE
	# options |= sublime.DRAW_STIPPLED_UNDERLINE
	style = "hint.warning"
	icon = "dot"
	
	if 'warnings' in data:
		# add warnings
		for warning in data["warnings"]:
			msg = warning["message"]
			loc = warning["loc"]
			region = sublime.Region(loc[0],loc[1])
			Regs.warn.append(region)


	view.erase_status("errors")

	if 'errors' in data:
		# add warnings
		for note in data["errors"]:
			msg = note["message"]
			reg = None
			if 'loc' in note:
				loc = note["loc"]
				reg = sublime.Region(loc[0],loc[1])
			elif 'line' in note:
				pt = view.text_point(note["line"], 0)
				pt2 = view.text_point(note["line"], 0) 
				reg = sublime.Region(pt,pt2)
			if reg:
				Regs.err.append(reg)
			view.set_status("errors", msg)


	view.add_regions("hint.warning",Regs.warn,style,icon,options)
	view.add_regions("hint.error",Regs.err,style,icon,options)


	IMBA_HINT_CACHE[str(view.id())] = data

	pass

def get_annotations_for_file(path):

	# cmd = "/usr/local/bin/imba"
	# cmd = "/Users/sindre/Code/imba/bin/imba"
	cmd = "imba"
	pars = "analyze %s"  % path
	args = [cmd,'analyze',path]

	proc = subprocess.Popen(args, stdin=subprocess.PIPE,
	stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
	env={"PATH": "/usr/local/bin:$PATH"})
	output, err = proc.communicate()
	output = output.decode("utf-8")
	return json.loads(output)# str(output).rstrip(os.linesep).decode('ascii').strip()

def get_cached_annotations_for_view(view):
	return IMBA_HINT_CACHE.get(str(view.id()),None)


def on_caret_hold(view):
	# print('on caret hold')
	# if we are over an error
	sel = view.sel()[0]
	info = None

	for idx,region in enumerate(view.get_regions("hint.warning")):
		if region.contains(sel):
			if info == None:
				info = get_cached_annotations_for_view(view)
			print("warning-region contains caret!")
			if info:
				msg = info and info["warnings"][idx]["message"]
				# view.set_status("hint.warning", msg)
				# view.run_command("auto_complete",{
				# 	'disable_auto_insert': True,
				# 	'api_completions_only': True
				# })
				view.show_popup_menu([msg], blank_function)

	for idx,region in enumerate(view.get_regions("hint.error")):
		if region.contains(sel):
			if info == None:
				info = get_cached_annotations_for_view(view)
			print("error-region contains caret!")
			if info:
				msg = info and info["errors"][idx]["message"]
				view.show_popup_menu([msg], blank_function)

	# sublime.run_command("show_auto_complete")
	pass

def blank_function(view):
	pass

def plugin_loaded():
	print("plugin_loaded")
	return
