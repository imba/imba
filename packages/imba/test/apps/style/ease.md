# for all properties
ea: duration | function? | delay?
ead: duration
eaf: function
eaw: wait

# ease-opacity
eo: duration | function? | delay?
eod: duration
eof: function
eow: wait

# ease-colors (color,background-color,box-shadow,text-shadow)
ec: duration | function? | delay?
ecd: duration
ecf: function
ecw: wait

# ease-box (width,height,top,bottom,left,right,max-width,max-height,transform)
eb: duration | function? | delay?
ebd: duration
ebf: function
ebw: wait

# ease-transform
falls back to ease-box if not defined
et: duration | function? | delay?
etd: duration
etf: function
etw: wait

# Discuss
Better with ease-duration-opacity than ease-opacity-duration?
Do we need the sub-groups? Is it not enough to just support the multi-purpose shorthands? They can be a bit ambiguous.