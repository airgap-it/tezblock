#!/usr/bin/env bash

prod_env_file="./src/environments/environment.prod.ts"
env_file="./src/environments/environment.ts"
npmrc="./.npmrc"

replace_base_url="s~'CONSEIL_BASE_URL',~'${CONSEIL_BASE_URL}',~g"
replace_api_key="s/'CONSEIL_API_KEY',/'${CONSEIL_API_KEY}',/g"

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

if [[ ! -z "${FONTAWESOME_NPM_AUTH_TOKEN}" ]]; then
	if [[ -f "${npmrc}" ]]; then
		replace_in_file 's~\# \(.*\)~\1~g' "${npmrc}"
	fi
	if [[ -f "${prod_env_file}" ]] && [[ -f "${env_file}" ]]; then
		replace_in_file 's/proFontAwesomeAvailable: false$/proFontAwesomeAvailable: true/g' "$prod_env_file"
		replace_in_file 's/proFontAwesomeAvailable: false$/proFontAwesomeAvailable: true/g' "$env_file"
	fi
	if [[ -f "${free_fa_add_file}" ]] && [[ -f "${pro_fa_add_file}" ]]; then
		mv "${free_fa_add_file}" "${free_fa_add_file}.bak"
		mv "${pro_fa_add_file}" "${free_fa_add_file}"
	fi
fi

if [[ ! -z "${CONSEIL_BASE_URL}" ]] && [[ ! -z "${CONSEIL_API_KEY}" ]] && [[ -f "$prod_env_file" ]] && [[ -f "$env_file" ]]; then
	replace_in_file "${replace_base_url}" "$prod_env_file"
	replace_in_file "${replace_base_url}" "$env_file"
	replace_in_file "${replace_api_key}" "$prod_env_file"
	replace_in_file "${replace_api_key}" "$env_file"
fi
