import os

# 1. Fix App.jsx
app_file = 'src/App.jsx'
with open(app_file, 'r') as f:
    content = f.read()

# Fix French translation checks
content = content.replace(
    "languages: (nextData.headings.languages === 'Languages' || nextData.headings.languages === 'Idiomas') ? 'Langues' : nextData.headings.languages",
    "languages: (nextData.headings.languages === 'Languages' || nextData.headings.languages === 'Languages:' || nextData.headings.languages === 'Idiomas') ? 'Langues' : nextData.headings.languages"
)
content = content.replace(
    "technical: (nextData.headings.technical === 'Technical Skills' || nextData.headings.technical === 'Habilidades técnicas') ? 'Compétences Techniques' : nextData.headings.technical",
    "technical: (nextData.headings.technical === 'Technical Skills' || nextData.headings.technical === 'Technical:' || nextData.headings.technical === 'Habilidades técnicas') ? 'Compétences Techniques' : nextData.headings.technical"
)
content = content.replace(
    "interpersonal: (nextData.headings.interpersonal === 'Soft Skills' || nextData.headings.interpersonal === 'Aptitudes') ? 'Savoir-être' : nextData.headings.interpersonal",
    "interpersonal: (nextData.headings.interpersonal === 'Soft Skills' || nextData.headings.interpersonal === 'Interpersonal:' || nextData.headings.interpersonal === 'Aptitudes') ? 'Savoir-être' : nextData.headings.interpersonal"
)

# Fix Spanish translation checks
content = content.replace(
    "languages: (nextData.headings.languages === 'Languages' || nextData.headings.languages === 'Langues') ? 'Idiomas' : nextData.headings.languages",
    "languages: (nextData.headings.languages === 'Languages' || nextData.headings.languages === 'Languages:' || nextData.headings.languages === 'Langues') ? 'Idiomas' : nextData.headings.languages"
)
content = content.replace(
    "technical: (nextData.headings.technical === 'Technical Skills' || nextData.headings.technical === 'Compétences Techniques') ? 'Habilidades Técnicas' : nextData.headings.technical",
    "technical: (nextData.headings.technical === 'Technical Skills' || nextData.headings.technical === 'Technical:' || nextData.headings.technical === 'Compétences Techniques') ? 'Habilidades Técnicas' : nextData.headings.technical"
)
content = content.replace(
    "interpersonal: (nextData.headings.interpersonal === 'Soft Skills' || nextData.headings.interpersonal === 'Savoir-être') ? 'Aptitudes' : nextData.headings.interpersonal",
    "interpersonal: (nextData.headings.interpersonal === 'Soft Skills' || nextData.headings.interpersonal === 'Interpersonal:' || nextData.headings.interpersonal === 'Savoir-être') ? 'Aptitudes' : nextData.headings.interpersonal"
)

# Fix English translation checks
content = content.replace(
    "languages: (nextData.headings.languages === 'Langues' || nextData.headings.languages === 'Idiomas') ? 'Languages' : nextData.headings.languages",
    "languages: (nextData.headings.languages === 'Langues' || nextData.headings.languages === 'Idiomas') ? 'Languages:' : nextData.headings.languages"
)
content = content.replace(
    "technical: (nextData.headings.technical === 'Compétences Techniques' || nextData.headings.technical === 'Habilidades Técnicas') ? 'Technical Skills' : nextData.headings.technical",
    "technical: (nextData.headings.technical === 'Compétences Techniques' || nextData.headings.technical === 'Habilidades Técnicas') ? 'Technical:' : nextData.headings.technical"
)
content = content.replace(
    "interpersonal: (nextData.headings.interpersonal === 'Savoir-être' || nextData.headings.interpersonal === 'Aptitudes') ? 'Soft Skills' : nextData.headings.interpersonal",
    "interpersonal: (nextData.headings.interpersonal === 'Savoir-être' || nextData.headings.interpersonal === 'Aptitudes') ? 'Interpersonal:' : nextData.headings.interpersonal"
)

with open(app_file, 'w') as f:
    f.write(content)

# 2. Fix displayHeading in all templates
templates = [
    'src/components/NjmTemplate.jsx',
    'src/components/ResumePreview.jsx',
    'src/components/CreativeTemplate.jsx',
    'src/components/MinimalistTemplate.jsx',
    'src/components/ModernTemplate.jsx'
]

for template in templates:
    if os.path.exists(template):
        with open(template, 'r') as f:
            t_content = f.read()
        
        t_content = t_content.replace(
            "if (vLower === defaultEn.toLowerCase() || vLower === key.toLowerCase() || vLower === 'technical:' || vLower === 'interpersonal:') return t(tKey);",
            "if (vLower === defaultEn.toLowerCase() || vLower === key.toLowerCase() || vLower === 'technical:' || vLower === 'interpersonal:' || vLower === 'languages:') return t(tKey);"
        )
        
        with open(template, 'w') as f:
            f.write(t_content)

print("Translation logic fixed!")
