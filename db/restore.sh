#!/usr/bin/env bash

docker exec -i nitrate-cancer-analysis psql -U postgres -d dev < ${PWD}/docker-entrypoint-initdb.d/dump.sql
