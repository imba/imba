import sublime_plugin
import datetime

'''
  __  __     __  __
 |  \/  |_ _|  \/  |
 | |\/| | '_| |\/| |_
 |_|  |_|_| |_|  |_(_)

Project: Examples of using show_quick_panel in Sublime 2

Platform: tested only on a Mac
Tested on: ST2 and ST3
July 19, 2013

File Name: mrm_show_quick_panel.py

Example pops up a list of dates with different formats.
and bonus:
  -learn how to invoke quick_panel from a hotkey,
    and from Sublime Text's "Command Palette "


Place file in your User folder
On Mac it is:
/Users/username/Library/Application Support/Sublime Text 2
   /Packages/User/mrm_show_quick_panel.py

On a Mac, this is a hidden folder,
Find the folder by going to Finder and
Go | Go to Folder
~/Library/Application Support/Sublime Text 2
press ENTER

---
Here are 3 methods for popping up Sublime Text's quick_panel

1 -- How to run this from console-----------------------------------
Once installed, run the following command from
the Python console (Ctrl+`):

view.run_command("show_goto_definition")
and you will see the list in the quick panel

Press Esc to cancel,
be careful if you run this when this file
is viewed, it will add the date text to this file. Try it on
a new blank file.


2 -- How to add this to a hotkey------------------------------------
How to add this to the hotkey ctrl+shift+8
by:
adding
{ "keys": ["ctrl+shift+8"], "command": "insert_date_panel" }
this to file
/Users/myusernameonmac/Library/Application Support/
    Sublime Text 2/Packages/User/Default (OSX).sublime-keymap

Note:
    You must use
    "insert_date_panel"
    for the class
    InsertDatePanelCommand
      i.e. CamelCase must be converted to lower case, with underscores

3 -- How to add this to the Command Palette  (Cmd-Shift-P) on Mac ---

a- Create a file:
  /Users/robmccormack/Library/Application Support/Sublime Text 2/
     Packages/User/Default.sublime-commands

  There is same file type of file located in:
      Packages/Default/Default.sublime-commands

   don't modify files in Packages/Default,
   they will be overwritten when upgrading
   always use the /User
   folder for user specific settings.

b- add this to file:
    Default.sublime-commands
[
     {
        "caption": "Insert Date from Quick Panel",
        "command": "insert_date_panel"
    }
]


c- Then you can press Cmd-Shift_P, and type in:
   Inser...
   - the first few letters of:
       Insert Date from Quick Panel
   and you will see this on list

To learn more about Python date formatting options:
  Python docs: 7.1.8. strftime() and strptime() behavior:
  http://tinyurl.com/pydates

 Style guide for Python
 http://www.python.org/dev/peps/pep-0008/

'''


class ShowGotoDefinitionCommand(sublime_plugin.TextCommand):

    def on_done(self, index):

        #  if user cancels with Esc key, do nothing
        #  if canceled, index is returned as  -1
        if index == -1:
            return

        # if user picks from list, return the correct entry
        self.view.run_command(
            "insert_my_text", {"args":
            {'text': self.list[index]}})

    def run(self, edit):

    # this will populate the quick_panel with 4 date formats
        d1 = str(datetime.datetime.now())
        d2 = str(datetime.date.today())

        d3 = datetime.date.today().strftime("%d %B %Y (%A)") + \
            ' @ ' + datetime.datetime.now().strftime("%H:%M")

        d4 = datetime.date.today().strftime("%A, %d-%B-%Y") + \
            datetime.datetime.now().strftime(" %I:%M %p")

        self.list = [d1, d2, d3, d4]

        # show_quick_panel(items, on_done, <flags>, <default_index>)
        # ref: http://www.sublimetext.com/forum/viewtopic.php?f=4&t=7139
        # take the list, and place it in a quick_panel, make 3rd item
        # default pick

        # self.view.window().show_quick_panel(self.list, self.on_done, 1, 2)
        self.view.show_popup_menu(self.list, self.on_done)


class InsertMyText(sublime_plugin.TextCommand):

    def run(self, edit, args):

        # add this to insert at current cursor position
        # http://www.sublimetext.com/forum/viewtopic.php?f=6&t=11509

        self.view.insert(edit, self.view.sel()[0].begin(), args['text'])