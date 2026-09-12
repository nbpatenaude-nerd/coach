import os

with open('d:/coach/app/components/landing/CosmicBackground.client.vue', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('vertexShader: \n      attribute float size;', 'vertexShader: `\n      attribute float size;')
content = content.replace('gl_Position = projectionMatrix * mvPosition;\n      }\n    ,', 'gl_Position = projectionMatrix * mvPosition;\n      }\n    `,')
content = content.replace('fragmentShader: \n      varying vec3 vColor;', 'fragmentShader: `\n      varying vec3 vColor;')
content = content.replace('gl_FragColor = vec4(vColor, alpha * 0.8);\n      }\n    ,', 'gl_FragColor = vec4(vColor, alpha * 0.8);\n      }\n    `,')

# It's better to just rewrite the whole file to be safe.
