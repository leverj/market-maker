FROM coinpit/nodejs:v8
COPY dist ./dist
RUN cd dist && npm install && useradd leverj
USER leverj
CMD node dist/lib/index.js
