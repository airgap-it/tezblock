#!/usr/bin/env bash

prod_env_file="./src/environments/environment.prod.ts"
env_file="./src/environments/environment.ts"
npmrc="./.npmrc"

free_fa_add_file="./src/app/fa-add.ts"
pro_fa_add_file="./src/app/fa-add.excluded.ts"

replace_in_file () {
	local pattern=$1
	local file=$2
	if [[ "$OSTYPE" == "darwin"* ]]; then
		sed -i '' "${pattern}" "${file}"
	else
		sed -i "${pattern}" "${file}"
	fi
}

replace_in_env_files () {
	if [[ -f "$prod_env_file" ]] && [[ -f "$env_file" ]]; then
		local pattern=$1
		replace_in_file "${pattern}" "$prod_env_file"
		replace_in_file "${pattern}" "$env_file"
	fi
}

if [[ -f "${prod_env_file}.tmp" ]] && [[ -f "${env_file}.tmp" ]]; then
	mv -f "${prod_env_file}.tmp" "${prod_env_file}"
	mv -f "${env_file}.tmp" "${env_file}"
fi

if [[ ! -z "${FONTAWESOME_NPM_AUTH_TOKEN}" ]]; then
	if [[ -f "${npmrc}" ]]; then
		replace_in_file 's~^\([^\#].*\)$~\# \1~g' "${npmrc}"
	fi
	if [[ -f "${free_fa_add_file}.tmp" ]] && [[ -f "${free_fa_add_file}" ]]; then
		mv "${free_fa_add_file}" "${pro_fa_add_file}"
		mv "${free_fa_add_file}.tmp" "${free_fa_add_file}"
	fi
fi
