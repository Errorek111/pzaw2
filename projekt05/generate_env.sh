#!/usr/bin/env bash

echo PORT=2137
echo SECRET=\"$(cat /dev/random | tr -cd "[:graph:]" | head -c64)\"
echo PEPPER=\"$(cat /dev/random | tr -cd "[:xdigit:]" | head -c64)\"
