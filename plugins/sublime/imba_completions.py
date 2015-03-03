import sublime, sublime_plugin
import re


def match(rex, str):
    m = rex.match(str)
    if m:
        return m.group(0)
    else:
        return None

def make_completion(tag):
    # make it look like
    # ("table\tTag", "table>$1</table>"),
    return ("<" + tag + "\tTAG", '<' + tag + "$0>")


def make_auto_completion(item,type):
    # make it look like
    # ("table\tTag", "table>$1</table>"),
    return (item + "\t" + type, item)

def get_tag_to_attributes():
    # maps tags to all available attributes
    return (
        {'a' : ['accesskey', 'charset', 'class', 'coords', 'dir', 'href', 'hreflang', 'id', 'lang', 'name', 'onblur', 'onclick', 'ondblclick', 'onfocus', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'rel', 'rev', 'shape', 'style', 'tabindex', 'target', 'title', 'type'],
        'applet' : ['align', 'alt', 'archive', 'class', 'code', 'codebase', 'height', 'hspace', 'id', 'name', 'object', 'style', 'title', 'vspace', 'width'],
        'area' : ['accesskey', 'alt', 'class', 'coords', 'dir', 'href', 'id', 'lang', 'nohref', 'onblur', 'onclick', 'ondblclick', 'onfocus', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'shape', 'style', 'tabindex', 'target', 'title'],
        'base' : ['href', 'target'],
        'basefont' : ['color', 'face', 'id', 'size'],
        'bdo' : ['class', 'dir', 'id', 'lang', 'style', 'title'],
        'blockquote' : ['cite', 'class', 'dir', 'id', 'lang', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'style', 'title'],
        'body' : ['alink', 'background', 'bgcolor', 'class', 'dir', 'id', 'lang', 'link', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'onunload', 'style', 'text', 'title', 'vlink'],
        'br' : ['class', 'clear', 'id', 'style', 'title'],
        'button' : ['accesskey', 'class', 'dir', 'disabled', 'id', 'lang', 'name', 'onblur', 'onclick', 'ondblclick', 'onfocus', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'style', 'tabindex', 'title', 'type', 'value'],
        'caption' : ['align', 'class', 'dir', 'id', 'lang', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'style', 'title'],
        'col' : ['align', 'char', 'charoff', 'class', 'dir', 'id', 'lang', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'span', 'style', 'title', 'valign', 'width'],
        'colgroup' : ['align', 'char', 'charoff', 'class', 'dir', 'id', 'lang', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'span', 'style', 'title', 'valign', 'width'],
        'del' : ['cite', 'class', 'datetime', 'dir', 'id', 'lang', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'style', 'title'],
        'dir' : ['class', 'compact', 'dir', 'id', 'lang', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'style', 'title'],
        'div' : ['align', 'class', 'dir', 'id', 'lang', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'style', 'title'],
        'dl' : ['class', 'compact', 'dir', 'id', 'lang', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'style', 'title'],
        'font' : ['class', 'color', 'dir', 'face', 'id', 'lang', 'size', 'style', 'title'],
        'form' : ['accept-charset', 'accept', 'action', 'class', 'dir', 'enctype', 'id', 'lang', 'method', 'name', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'onreset', 'onsubmit', 'style', 'target', 'title'],
        'frame' : ['class', 'frameborder', 'id', 'longdesc', 'marginheight', 'marginwidth', 'name', 'noresize', 'scrolling', 'src', 'style', 'title'],
        'frameset' : ['class', 'cols', 'id', 'onload', 'onunload', 'rows', 'style', 'title'],
        'h1' : ['align', 'class', 'dir', 'id', 'lang', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'style', 'title'],
        'h2' : ['align', 'class', 'dir', 'id', 'lang', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'style', 'title'],
        'h3' : ['align', 'class', 'dir', 'id', 'lang', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'style', 'title'],
        'h4' : ['align', 'class', 'dir', 'id', 'lang', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'style', 'title'],
        'h5' : ['align', 'class', 'dir', 'id', 'lang', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'style', 'title'],
        'h6' : ['align', 'class', 'dir', 'id', 'lang', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'style', 'title'],
        'head' : ['dir', 'lang', 'profile'],
        'hr' : ['align', 'class', 'dir', 'id', 'lang', 'noshade', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'size', 'style', 'title', 'width'],
        'html' : ['dir', 'lang', 'version'],
        'iframe' : ['align', 'class', 'frameborder', 'height', 'id', 'longdesc', 'marginheight', 'marginwidth', 'name', 'scrolling', 'src', 'style', 'title', 'width'],
        'img' : ['align', 'alt', 'border', 'class', 'dir', 'height', 'hspace', 'id', 'ismap', 'lang', 'longdesc', 'name', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'src', 'style', 'title', 'usemap', 'vspace', 'width'],
        'input' : ['accept', 'accesskey', 'align', 'alt', 'checked', 'class', 'dir', 'disabled', 'id', 'ismap', 'lang', 'maxlength', 'name', 'onblur', 'onchange', 'onclick', 'ondblclick', 'onfocus', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'onselect', 'readonly', 'size', 'src', 'style', 'tabindex', 'title', 'type', 'usemap', 'value'],
        'ins' : ['cite', 'class', 'datetime', 'dir', 'id', 'lang', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'style', 'title'],
        'isindex' : ['class', 'dir', 'id', 'lang', 'prompt', 'style', 'title'],
        'label' : ['accesskey', 'class', 'dir', 'for', 'id', 'lang', 'onblur', 'onclick', 'ondblclick', 'onfocus', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'style', 'title'],
        'legend' : ['accesskey', 'align', 'class', 'dir', 'id', 'lang', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'style', 'title'],
        'li' : ['class', 'dir', 'id', 'lang', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'style', 'title', 'type', 'value'],
        'link' : ['charset', 'class', 'dir', 'href', 'hreflang', 'id', 'lang', 'media', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'rel', 'rev', 'style', 'target', 'title', 'type'],
        'map' : ['class', 'dir', 'id', 'lang', 'name', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'style', 'title'],
        'menu' : ['class', 'compact', 'dir', 'id', 'lang', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'style', 'title'],
        'meta' : ['content', 'dir', 'http-equiv', 'lang', 'name', 'scheme'],
        'object' : ['align', 'archive', 'border', 'class', 'classid', 'codebase', 'codetype', 'data', 'declare', 'dir', 'height', 'hspace', 'id', 'lang', 'name', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'standby', 'style', 'tabindex', 'title', 'type', 'usemap', 'vspace', 'width'],
        'ol' : ['class', 'compact', 'dir', 'id', 'lang', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'start', 'style', 'title', 'type'],
        'optgroup' : ['class', 'dir', 'disabled', 'id', 'label', 'lang', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'style', 'title'],
        'option' : ['class', 'dir', 'disabled', 'id', 'label', 'lang', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'selected', 'style', 'title', 'value'],
        'p' : ['align', 'class', 'dir', 'id', 'lang', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'style', 'title'],
        'param' : ['id', 'name', 'type', 'value', 'valuetype'],
        'pre' : ['class', 'dir', 'id', 'lang', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'style', 'title', 'width'],
        'q' : ['cite', 'class', 'dir', 'id', 'lang', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'style', 'title'],
        'script' : ['charset', 'defer', 'language', 'src', 'type'],
        'select' : ['class', 'dir', 'disabled', 'id', 'lang', 'multiple', 'name', 'onblur', 'onchange', 'onclick', 'ondblclick', 'onfocus', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'size', 'style', 'tabindex', 'title'],
        'style' : ['dir', 'lang', 'media', 'title', 'type'],
        'table' : ['align', 'bgcolor', 'border', 'cellpadding', 'cellspacing', 'class', 'dir', 'frame', 'id', 'lang', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'rules', 'style', 'summary', 'title', 'width'],
        'tbody' : ['align', 'char', 'charoff', 'class', 'dir', 'id', 'lang', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'style', 'title', 'valign'],
        'td' : ['abbr', 'align', 'axis', 'bgcolor', 'char', 'charoff', 'class', 'colspan', 'dir', 'headers', 'height', 'id', 'lang', 'nowrap', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'rowspan', 'scope', 'style', 'title', 'valign', 'width'],
        'textarea' : ['accesskey', 'class', 'cols', 'dir', 'disabled', 'id', 'lang', 'name', 'onblur', 'onchange', 'onclick', 'ondblclick', 'onfocus', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'onselect', 'readonly', 'rows', 'style', 'tabindex', 'title'],
        'tfoot' : ['align', 'char', 'charoff', 'class', 'dir', 'id', 'lang', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'style', 'title', 'valign'],
        'th' : ['abbr', 'align', 'axis', 'bgcolor', 'char', 'charoff', 'class', 'colspan', 'dir', 'headers', 'height', 'id', 'lang', 'nowrap', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'rowspan', 'scope', 'style', 'title', 'valign', 'width'],
        'thead' : ['align', 'char', 'charoff', 'class', 'dir', 'id', 'lang', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'style', 'title', 'valign'],
        'tr' : ['align', 'bgcolor', 'char', 'charoff', 'class', 'dir', 'id', 'lang', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'style', 'title', 'valign'],
        'ul' : ['class', 'compact', 'dir', 'id', 'lang', 'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'style', 'title', 'type'],}
        )

def get_pseudo_selectors():
    items = (['before','after','hover','selected','focus','active'])
    return [make_auto_completion(item,'pseudo-selector') for item in items]

def get_html_tags():
    items = (["abbr", "acronym", "address", "applet", "area", "b", "base", "big", "blockquote", "body", "button", "center", "caption",
            "cdata", "cite", "col", "colgroup", "code", "div", "dd", "del", "dfn", "dl", "dt", "em", "fieldset", "font", "form", "frame", "frameset",
            "head", "h1", "h2", "h3", "h4", "h5", "h6", "i", "ins", "kbd", "li", "label", "legend", "map", "noframes", "object", "ol", "optgroup", "option",
            "p", "pre", "span", "samp", "select", "small", "strong", "sub", "sup", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "title",
            "tr", "tt", "u", "ul", "var", "article", "aside", "audio", "canvas", "footer", "header", "nav", "section", "video"])
    return items

class ImbaCompletions(sublime_plugin.EventListener):
    """
    Provide tag completions for Imba
    It matches just after typing the first letter of a tag name
    """
    def __init__(self):
        completion_list = self.default_completion_list()
        self.prefix_completion_dict = {}
        self.default_pseudo_selectors = get_pseudo_selectors()

        self.default_html_tags = [make_auto_completion(item,'tag') for item in get_html_tags()]
        self.prefix_tag_completion = [make_completion(item) for item in get_html_tags()]
        
        # construct a dictionary where the key is first character of
        # the completion list to the completion
        for s in completion_list:
            prefix = s[0][0]
            self.prefix_completion_dict.setdefault(prefix, []).append(s)

        # construct a dictionary from (tag, attribute[0]) -> [attribute]
        self.tag_to_attributes = get_tag_to_attributes()


    def get_selector_classes(self,view):
        return [("canvas\tclass","canvas")]

    def get_selector_ids(self,view):
        return [("app\ttag","app")]

    def match_type(self,view,loc,typ):
        return view.match_selector(loc,"entity.name.tag." + typ)

    def on_query_completions(self, view, prefix, locations):

        if not view.match_selector(locations[0],"source.imba"):
            return []

        print('prefix:!', prefix)

        warn = view.get_status("hint.warning")
        if warn:
            print("there is a warning!!!")
            print(warn)
            view.erase_status("hint.warning")
            return [(prefix + ": " + warn + "\t" + "warning", "hint.warning")]
        
        print('location0:', locations[0])
        print('character:', view.substr(locations[0] - 1))
        print('scope_name before:', view.scope_name(locations[0] - 1))

        loc = locations[0]
        char = view.substr(locations[0] - 1)

        if view.match_selector(locations[0],"meta.tag"):

            is_class = char == '.' or self.match_type(view,loc - 1,"class")
            items = []

            if is_class:
                items.extend(self.get_selector_classes(view))
            elif char == '<' or self.match_type(view,loc - 1,"type"):
                items.extend(self.default_html_tags)
            # else:
            #     items.extend(self.default_html_tags)
            # if char == "<":
            #     print('show tag prefixes!!')
            #     return self.default_html_tags
            # items.extend(self.get_selector_classes(view))
            # items = (items,sublime.INHIBIT_WORD_COMPLETIONS | sublime.INHIBIT_EXPLICIT_COMPLETIONS)
            return  (items,sublime.INHIBIT_WORD_COMPLETIONS | sublime.INHIBIT_EXPLICIT_COMPLETIONS)

        elif view.match_selector(locations[0],"meta.selector"):
            items = []
            print('autocomplete ' + char)
            if char == ".":
                items = self.get_selector_classes(view)
            elif char == "#":
                items = self.get_selector_ids(view)
            elif char == ":":
                items = self.default_pseudo_selectors
            elif char == " ":
                items = self.default_html_tags
            items = (items,sublime.INHIBIT_WORD_COMPLETIONS | sublime.INHIBIT_EXPLICIT_COMPLETIONS)
            return items
        elif char == "<":
            print('show tag prefixes!!')
            return self.prefix_tag_completion
            # items = (items,sublime.INHIBIT_WORD_COMPLETIONS | sublime.INHIBIT_EXPLICIT_COMPLETIONS)
            # return items



        # Only trigger within Imba
        if not view.match_selector(locations[0],
                "source.imba"):
            return [("nothing","ok")]

        return [("hello","ok")]


        # check if we are inside a tag
        is_inside_tag = view.match_selector(locations[0],
                "text.html meta.tag - text.html punctuation.definition.tag.begin")

        return self.get_completions(view, prefix, locations, is_inside_tag)

    def get_completions(self, view, prefix, locations, is_inside_tag):
        # see if it is in tag.attr or tag#attr format
        if not is_inside_tag:
            tag_attr_expr = self.expand_tag_attributes(view, locations)
            if tag_attr_expr != []:
                return (tag_attr_expr, sublime.INHIBIT_WORD_COMPLETIONS | sublime.INHIBIT_EXPLICIT_COMPLETIONS)

        pt = locations[0] - len(prefix) - 1
        ch = view.substr(sublime.Region(pt, pt + 1))

        # print('prefix:', prefix)
        # print('location0:', locations[0])
        # print('substr:', view.substr(sublime.Region(locations[0], locations[0] + 3)), '!end!')
        # print('is_inside_tag', is_inside_tag)
        # print('ch:', ch)

        completion_list = []
        if is_inside_tag and ch != '<':
            if ch in [' ', '\t', '\n']:
                # maybe trying to type an attribute
                completion_list = self.get_attribute_completions(view, locations[0], prefix)
            # only ever trigger completion inside a tag if the previous character is a <
            # this is needed to stop completion from happening when typing attributes
            return (completion_list, sublime.INHIBIT_WORD_COMPLETIONS | sublime.INHIBIT_EXPLICIT_COMPLETIONS)

        if prefix == '':
            # need completion list to match
            return ([], sublime.INHIBIT_WORD_COMPLETIONS | sublime.INHIBIT_EXPLICIT_COMPLETIONS)

        # match completion list using prefix
        completion_list = self.prefix_completion_dict.get(prefix[0], [])

        # if the opening < is not here insert that
        if ch != '<':
            completion_list = [(pair[0], '<' + pair[1]) for pair in completion_list]

        flags = 0
        if is_inside_tag:
            sublime.INHIBIT_WORD_COMPLETIONS | sublime.INHIBIT_EXPLICIT_COMPLETIONS

        return (completion_list, flags)

    def default_completion_list(self):
        """ generate a default completion list for Imba """
        default_list = []
        normal_tags = (["abbr", "acronym", "address", "applet", "area", "b", "base", "big", "blockquote", "body", "button", "center", "caption",
            "cdata", "cite", "col", "colgroup", "code", "div", "dd", "del", "dfn", "dl", "dt", "em", "fieldset", "font", "form", "frame", "frameset",
            "head", "h1", "h2", "h3", "h4", "h5", "h6", "i", "ins", "kbd", "li", "label", "legend", "map", "noframes", "object", "ol", "optgroup", "option",
            "p", "pre", "span", "samp", "select", "small", "strong", "sub", "sup", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "title",
            "tr", "tt", "u", "ul", "var", "article", "aside", "audio", "canvas", "footer", "header", "nav", "section", "video"])

        for tag in normal_tags:
            default_list.append(make_completion(tag))
            default_list.append(make_completion(tag.upper()))

        default_list += ([
            ("a\tTag", "a href=\"$1\">$0</a>"),
            ("iframe\tTag", "iframe src=\"$1\">$0</iframe>"),
            ("link\tTag", "link rel=\"stylesheet\" type=\"text/css\" href=\"$1\">"),
            ("script\tTag", "script type=\"${1:text/javascript}\">$0</script>"),
            ("style\tTag", "style type=\"${1:text/css}\">$0</style>"),
            ("img\tTag", "img src=\"$1\">"),
            ("param\tTag", "param name=\"$1\" value=\"$2\">")
        ])

        return default_list

    # This responds to on_query_completions, but conceptually it's expanding
    # expressions, rather than completing words.
    #
    # It expands these simple expressions:
    # tag.class
    # tag#id
    def expand_tag_attributes(self, view, locations):
        # Get the contents of each line, from the beginning of the line to
        # each point
        lines = [view.substr(sublime.Region(view.line(l).a, l))
            for l in locations]

        # Reverse the contents of each line, to simulate having the regex
        # match backwards
        lines = [l[::-1] for l in lines]

        # Check the first location looks like an expression
        rex = re.compile("([\w-]+)([.#])(\w+)")
        expr = match(rex, lines[0])
        if not expr:
            return []

        # Ensure that all other lines have identical expressions
        for i in range(1, len(lines)):
            ex = match(rex, lines[i])
            if ex != expr:
                return []

        # Return the completions
        arg, op, tag = rex.match(expr).groups()

        arg = arg[::-1]
        tag = tag[::-1]
        expr = expr[::-1]

        if op == '.':
            snippet = "<{0} class=\"{1}\">$1</{0}>$0".format(tag, arg)
        else:
            snippet = "<{0} id=\"{1}\">$1</{0}>$0".format(tag, arg)

        return [(expr, snippet)]

    def get_attribute_completions(self, view, pt, prefix):
        SEARCH_LIMIT = 500
        search_start = max(0, pt - SEARCH_LIMIT - len(prefix))
        line = view.substr(sublime.Region(search_start, pt + SEARCH_LIMIT))

        line_head = line[0:pt - search_start]
        line_tail = line[pt - search_start:]

        # find the tag from end of line_head
        i = len(line_head) - 1
        tag = None
        space_index = len(line_head)
        while i >= 0:
            c = line_head[i]
            if c == '<':
                # found the open tag
                tag = line_head[i + 1:space_index]
                break
            if c == ' ':
                space_index = i
            i -= 1

        # check that this tag looks valid
        if not tag or not tag.isalnum():
            return []

        # determines whether we need to close the tag
        # default to closing the tag
        suffix = '>'

        for c in line_tail:
            if c == '>':
                # found end tag
                suffix = ''
                break
            if c == '<':
                # found another open tag, need to close this one
                break

        if suffix == '' and not line_tail.startswith(' ') and not line_tail.startswith('>'):
            # add a space if not there
            suffix = ' '

        # got the tag, now find all attributes that match
        attributes = self.tag_to_attributes.get(tag, [])
        # ("class\tAttr", "class="$1">"),
        attri_completions = [(a + '\tAttr', a + '="$1"' + suffix) for a in attributes]
        return attri_completions

