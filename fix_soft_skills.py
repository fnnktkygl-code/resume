import os

translations_file = 'src/utils/translations.js'
with open(translations_file, 'r') as f:
    content = f.read()

content = content.replace("'Soft Skills': 'Savoir-être',", "'Soft Skills': 'Soft Skills',")
content = content.replace("'Soft Skills Header': 'Titre Savoir-être',", "'Soft Skills Header': 'Titre Soft Skills',")

content = content.replace("'Soft Skills': 'Aptitudes',", "'Soft Skills': 'Soft Skills',")
content = content.replace("'Soft Skills Header': 'Título Aptitudes',", "'Soft Skills Header': 'Título Soft Skills',")

with open(translations_file, 'w') as f:
    f.write(content)

app_file = 'src/App.jsx'
with open(app_file, 'r') as f:
    content = f.read()

content = content.replace("'Savoir-être'", "'Soft Skills'")
content = content.replace("'Aptitudes'", "'Soft Skills'")

with open(app_file, 'w') as f:
    f.write(content)

print("Soft Skills translations updated!")
