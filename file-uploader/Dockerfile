FROM skippbox/tensorflow:0.0.1
RUN curl -sL https://deb.nodesource.com/setup_7.x | bash -
RUN apt-get install nodejs
ADD . /opt
EXPOSE 8080
USER 0
CMD ["node", "/opt/server.js"]

