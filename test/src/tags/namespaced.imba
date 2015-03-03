
tag element

tag html:element

tag html:div

tag html:span

tag html:input

tag html:canvas


tag welcome # < html:element
# defined on the main html namespace



# if the namespace does not exist, create the namespace, inherit from html namespace
# so that spawning app:input 

tag app:element # < html:element
# has no element-tag, only ns-app
# $$.App.canvas() would now simply return a html:canvas, silently.
# this might be a problem. If the call was instead $$app('canvas')
# it would be possible to give a warning if it does not exist?
# but we don't want warnings, it is more for the implicitly namespaced tags
# so maybe it should be different for implicit and explicit ones?


tag app:canvas # < app:element
# native type since canvas is supported (or, since html:canvas exists)
# class is ns-app

tag app:planet # < app:element < html:element < element
# native type is div, since planet is not a real html tag-type
# class is ns-app planet-tag

tag app:earth < app:planet
# we expect the supertag to be in the same namespace,
# so there isn't really a need to supply it.
# native type is div
# class is (ns-app planet-tag) earth-tag -- set when defining the tag
# $$.App.earth()




# this seems like it inherits from canvas directly, but it really does not?
# what it should is it should inherit from app:canvas, which does not exist, but
# then use the canvas as the native type
tag io:drawboard < io:page (canvas)



# we could possibly allow inheritance across namespaces, yet default back to
# namespace:element if none exists?

# creating a tag will 
# ns io:toolbar

# should there be 




###

$$('input','app')

$$.App.input().title('hello')
$$.Svg.svg()
$$.app()

###


# do this later
# nested namespaces?
tag app:hud:element # < app:element < html:element

# this is a tricky one. it cannot really inherit from app:earth, as
# tags in namespaces need to inherit from ns:element
tag app:hud:earth # < 
