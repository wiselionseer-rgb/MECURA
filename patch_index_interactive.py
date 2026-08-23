with open("index.html", "r") as f:
    code = f.read()

code = code.replace(
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover, interactive-widget=resizes-content" />'
)

with open("index.html", "w") as f:
    f.write(code)
