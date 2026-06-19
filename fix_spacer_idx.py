import os

templates = [
    'src/components/ModernTemplate.jsx',
    'src/components/CreativeTemplate.jsx',
    'src/components/MinimalistTemplate.jsx',
    'src/components/NjmTemplate.jsx'
]

for template in templates:
    with open(template, 'r') as f:
        content = f.read()

    # In Modern/Creative sidebar and main loops
    content = content.replace(
        "!printMode && onAddSectionSpacer && InsertSpacerButton && idx > 0 &&",
        "!printMode && onAddSectionSpacer && InsertSpacerButton &&"
    )
    
    # In Minimalist/Njm loops
    content = content.replace(
        "!printMode && onAddSectionSpacer && InsertSpacerButton && sectionIdx > 0 &&",
        "!printMode && onAddSectionSpacer && InsertSpacerButton &&"
    )

    with open(template, 'w') as f:
        f.write(content)

print("Spacer idx > 0 restrictions removed!")
