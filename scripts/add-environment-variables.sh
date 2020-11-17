#!/usr/bin/env bash

prod_env_file="./src/environments/environment.prod.ts"
env_file="./src/environments/environment.ts"
npmrc="./.npmrc"

replace_main_rpc_url_pattern="s~'MAINNET_RPC_URL'\(,\)\{0,1\}~'${MAINNET_RPC_URL}'\1~g"
replace_carthage_rpc_url_pattern="s~'CARTHAGENET_RPC_URL'\(,\)\{0,1\}~'${CARTHAGENET_RPC_URL}'\1~g"
replace_delphi_rpc_url_pattern="s~'DELPHINET_RPC_URL'\(,\)\{0,1\}~'${DELPHINET_RPC_URL}'\1~g"

replace_main_conseil_url_pattern="s~'MAINNET_CONSEIL_URL'\(,\)\{0,1\}~'${MAINNET_CONSEIL_URL}'\1~g"
replace_carthage_conseil_url_pattern="s~'CARTHAGENET_CONSEIL_URL'\(,\)\{0,1\}~'${CARTHAGENET_CONSEIL_URL}'\1~g"
replace_delphi_conseil_url_pattern="s~'DELPHINET_CONSEIL_URL'\(,\)\{0,1\}~'${DELPHINET_CONSEIL_URL}'\1~g"

replace_main_conseil_api_pattern="s/'MAINNET_CONSEIL_API_KEY'\(,\)\{0,1\}/'${MAINNET_CONSEIL_API_KEY}'\1/g"
replace_carthage_conseil_api_pattern="s/'CARTHAGENET_CONSEIL_API_KEY'\(,\)\{0,1\}/'${CARTHAGENET_CONSEIL_API_KEY}'\1/g"
replace_delphi_conseil_api_pattern="s/'DELPHINET_CONSEIL_API_KEY'\(,\)\{0,1\}/'${DELPHINET_CONSEIL_API_KEY}'\1/g"

replace_main_target_url_pattern="s~'MAINNET_TARGET_URL'\(,\)\{0,1\}~'${MAINNET_TARGET_URL}'\1~g"
replace_carthage_target_url_pattern="s~'CARTHAGENET_TARGET_URL'\(,\)\{0,1\}~'${CARTHAGENET_TARGET_URL}'\1~g"
replace_delphi_target_url_pattern="s~'DELPHINET_TARGET_URL'\(,\)\{0,1\}~'${DELPHINET_TARGET_URL}'\1~g"

# replace_ga_pattern="s/'GA_KEY'\(,\)\{0,1\}/'${GA_KEY}'\1/g"
replace_ga_pattern="s/googleAnalyticsKey: undefined\(,\)\{0,1\}/googleAnalyticsKey: '${GA_KEY}'\1/g"
replace_fa_pattern="s/proFontAwesomeAvailable: false\(,\)\{0,1\}$/proFontAwesomeAvailable: true\1/g"

free_fa_add_file="./src/app/fa-add.ts"
pro_fa_add_file="./src/app/fa-add.excluded.ts"

needs_env_backup () {
	[[ ! -z "${MAINNET_RPC_URL}" ]] || [[ ! -z "${CARTHAGENET_RPC_URL}" ]] || [[ ! -z "${DELPHINET_RPC_URL}" ]] ||
	[[ ! -z "${MAINNET_CONSEIL_URL}" ]] || [[ ! -z "${CARTHAGENET_CONSEIL_URL}" ]] || [[ ! -z "${DELPHINET_CONSEIL_URL}" ]] ||
	[[ ! -z "${MAINNET_CONSEIL_API_KEY}" ]] || [[ ! -z "${CARTHAGENET_CONSEIL_API_KEY}" ]] || [[ ! -z "${DELPHINET_CONSEIL_API_KEY}" ]] ||
	[[ ! -z "${MAINNET_TARGET_URL}" ]] || [[ ! -z "${CARTHAGENET_TARGET_URL}" ]] || [[ ! -z "${DELPHINET_TARGET_URL}" ]] ||
	[[ ! -z "${GA_KEY}" ]] ||
	[[ ! -z "${FONTAWESOME_NPM_AUTH_TOKEN}" ]]
}

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

replace_rpc_url () {
	if [[ ! -z "${MAINNET_RPC_URL}" ]]; then
		replace_in_env_files "${replace_main_rpc_url_pattern}"
	fi
	if [[ ! -z "${CARTHAGENET_RPC_URL}" ]]; then
		replace_in_env_files "${replace_carthage_rpc_url_pattern}"
	fi
	if [[ ! -z "${DELPHINET_RPC_URL}" ]]; then
		replace_in_env_files "${replace_delphi_rpc_url_pattern}"
	fi
}

replace_conseil_url () {
	if [[ ! -z "${MAINNET_CONSEIL_URL}" ]]; then
		replace_in_env_files "${replace_main_conseil_url_pattern}"
	fi
	if [[ ! -z "${CARTHAGENET_CONSEIL_URL}" ]]; then
		replace_in_env_files "${replace_carthage_conseil_url_pattern}"
	fi
	if [[ ! -z "${DELPHINET_CONSEIL_URL}" ]]; then
		replace_in_env_files "${replace_delphi_conseil_url_pattern}"
	fi
}

replace_conseil_api_key () {
	if [[ ! -z "${MAINNET_CONSEIL_API_KEY}" ]]; then
		replace_in_env_files "${replace_main_conseil_api_pattern}"
	fi
	if [[ ! -z "${CARTHAGENET_CONSEIL_API_KEY}" ]]; then
		replace_in_env_files "${replace_carthage_conseil_api_pattern}"
	fi
	if [[ ! -z "${DELPHINET_CONSEIL_API_KEY}" ]]; then
		replace_in_env_files "${replace_delphi_conseil_api_pattern}"
	fi
}

replace_target_url () {
	if [[ ! -z "${MAINNET_TARGET_URL}" ]]; then
		replace_in_env_files "${replace_main_target_url_pattern}"
	fi
	if [[ ! -z "${CARTHAGENET_TARGET_URL}" ]]; then
		replace_in_env_files "${replace_carthage_target_url_pattern}"
	fi
	if [[ ! -z "${DELPHINET_TARGET_URL}" ]]; then
		replace_in_env_files "${replace_delphi_target_url_pattern}"
	fi
}

replace_ga_key () {
	if [[ ! -z "${GA_KEY}" ]]; then
		replace_in_env_files "${replace_ga_pattern}"
	fi
}

replace_fa_settings () {
	if [[ ! -z "${FONTAWESOME_NPM_AUTH_TOKEN}" ]]; then
	if [[ -f "${npmrc}" ]]; then
		replace_in_file 's~\# \(.*\)~\1~g' "${npmrc}"
	fi
	if [[ -f "${prod_env_file}" ]] && [[ -f "${env_file}" ]]; then
		replace_in_env_files "${replace_fa_pattern}"
	fi
	if [[ -f "${free_fa_add_file}" ]] && [[ -f "${pro_fa_add_file}" ]]; then
		mv "${free_fa_add_file}" "${free_fa_add_file}.tmp"
		mv "${pro_fa_add_file}" "${free_fa_add_file}"
	fi
fi
}

if needs_env_backup; then
	if [[ -f "$prod_env_file" ]] && [[ -f "$env_file" ]] && [[ ! -f "${prod_env_file}.tmp" ]] && [[ ! -f "${env_file}.tmp" ]]; then
		cp "${prod_env_file}" "${prod_env_file}.tmp"
		cp "${env_file}" "${env_file}.tmp"
	fi
fi

replace_fa_settings
replace_rpc_url
replace_conseil_url
replace_conseil_api_key
replace_target_url
replace_ga_key
