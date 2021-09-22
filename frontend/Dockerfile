FROM node:alpine

# Set proxy server as build argument
ARG PROXY

# Set frontend as working directory
WORKDIR '/frontend'

# Install dependencies
RUN apk add --no-cache \
    jq

COPY package.json .

# Update proxy
RUN jq ".proxy |= \"$PROXY\"" package.json > package.updated.json
RUN mv package.updated.json package.json

# Install react dependencies
RUN yarn install

# Copy necessary files
COPY public public
COPY src src

# Export port 3000
EXPOSE 3000

# Start React client
ENTRYPOINT ["yarn"]
CMD ["start"]
