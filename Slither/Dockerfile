FROM ubuntu:20.04
ARG DEBIAN_FRONTEND=noninteractive

# # set work directory
WORKDIR /auditFiles

# set environment variables..j.
# Prevents Python from writing pyc files to disc (equivalent to python -B option)
ENV PYTHONDONTWRITEBYTECODE 1
# PYTHONUNBUFFERED: Prevents Python from buffering stdout and stderr (equivalent to python -u option)
ENV PYTHONUNBUFFERED 1

RUN  apt-get update
RUN  apt-get install -y curl
RUN  apt-get install -y software-properties-common
RUN  add-apt-repository -y ppa:ethereum/ethereum
RUN  apt-get update
RUN  apt-get install -y solc
RUN  apt-get install libssl-dev
RUN  apt-get install -y python3-pip python3.9 python3.9-dev
RUN  ln -s /usr/bin/python3 /usr/local/bin/python
RUN  apt-get install -y pandoc
RUN  apt-get install -y git
# RUN  apt-get install -y nodejs
RUN  apt-get install -y npm
RUN pip install numpy
RUN pip3 install numpy    

RUN git clone https://github.com/crytic/slither && cd slither && python3 setup.py install

RUN npm install -g truffle
RUN npm install -g ganache-cli

RUN pip3 install solc-select
RUN solc-select install 0.8.19

# RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs -y | sh
RUN curl -L https://foundry.paradigm.xyz | bash
RUN source /root/.bashrc | bash
RUN foundryup | bash

# NodeJs
RUN rm /bin/sh && ln -s /bin/bash /bin/sh
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
RUN source ~/.nvm/nvm.sh && nvm install 16 && nvm use 16
