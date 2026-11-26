set -e
cd "$(dirname "$0")"
rm -rf dist; EXPO_OFFLINE=1 CI=1 npx expo export --platform web 2>&1 | grep -E "rror|Exported"
cd dist; mkdir -p js fonts; mv _expo/static/js/web/*.js js/app.js; F=$(find assets -name '*.ttf'); mv "$F" fonts/MaterialIcons.ttf; rm -rf _expo assets metadata.json
sed -i 's#"/assets/node_modules/@react-native-vector-icons/material-icons/fonts/MaterialIcons\.[a-f0-9]*\.ttf"#"./fonts/MaterialIcons.ttf"#g' js/app.js
python3 - <<'EOF'
import re
s=open('index.html').read()
s=re.sub(r'src="/_expo/static/js/web/AppEntry-[a-f0-9]+\.js"','src="./js/app.js"',s)
s=s.replace('<title>predlytics</title>','<title>Oddlytics prototype</title>')
ff="@font-face{font-family:'MaterialIcons';src:url('./fonts/MaterialIcons.ttf') format('truetype');}@font-face{font-family:'MaterialIcons-Regular';src:url('./fonts/MaterialIcons.ttf') format('truetype');}"
s=s.replace('</head>','<style>'+ff+'html,body{background:#000;margin:0}*{scrollbar-width:none;-ms-overflow-style:none}*::-webkit-scrollbar{display:none;width:0;height:0}input,textarea{outline:none!important;box-shadow:none!important}input:focus,textarea:focus,input:focus-visible,textarea:focus-visible{outline:none!important}</style></head>',1)
open('app.html','w').write(s)
EOF
cp ../wrapper.html index.html; rm -rf ../web; cp -r . ../web
grep -c fonts/MaterialIcons js/app.js
