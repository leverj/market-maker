FROM coinpit/nodejs:v8
COPY lib config ./dist
RUN apt-get update && cd dist && npm install && useradd leverj
USER leverj
CMD node dist/lib/index.js
