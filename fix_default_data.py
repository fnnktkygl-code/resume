import os

constants_file = 'src/utils/constants.jsx'
with open(constants_file, 'r') as f:
    content = f.read()

content = content.replace("technical: 'Technical:',", "technical: 'Technical Skills',")
content = content.replace("interpersonal: 'Interpersonal:',", "interpersonal: 'Soft Skills',")
content = content.replace("languages: 'Languages:',", "languages: 'Languages',")

with open(constants_file, 'w') as f:
    f.write(content)

print("Default data updated!")
