<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { useCardanoWallet } from '$lib/store';

	const { list, connect, isConnected, wallet, selected, disconnect } = useCardanoWallet;

	export let buttonClass =
		'border-2 border-gray-300 bg-gray-100 text-gray-800 rounded-md px-4 py-2 hover:bg-gray-200 focus:outline-none';
	export let dropdownClass =
		'origin-top-right absolute right-0 m-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5';
	export let itemClass =
		'px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900 flex gap-2 capitalize text-[16px] items-center';
	export let modalClass =
		'bg-white rounded-lg text-left overflow-hidden shadow-2xl transform transition-all max-w-3xl md:max-w-xl md:w-[25vh] w-full p-6 mx-6 border-gray-400 border ';
	export let displayToken: boolean = false;
	export let policyID: string = '';

	let balance: number;
	let networkId: number | undefined;
	let handleName: string;
	let fungibleToken: any;

	$: if ($wallet) {
		$wallet
			.getAssets('handles')
			.then((assets) => {
				if (assets.length > 0) {
					handleName = assets[0].assetName;
				}
			})
			.catch((error) => {
				if (error) {
					balance = 0;
				}
			});

		$wallet.getNetworkId().then((id) => {
			networkId = id;
		});

		$wallet
			.getAssets('ada')
			.then((ada) => {
				balance = ada;
			})
			.catch((error) => {
				if (error.message === 'Error: This wallet has no tokens') {
					balance = 0;
				}
			});

		if (displayToken) {
			if ($wallet) {
				$wallet.getAssets('policy', policyID).then((fts) => {
					if (fts === 'This wallet has no tokens') {
						fungibleToken = null;
					} else {
						fungibleToken = fts[0];
					}
				});
			}
		}
	}

	let isModalVisible = false;
	let dropdownVisible = false;
	let dropdownElement: any;
	let buttonElement: any;

	function openModal() {
		isModalVisible = true;
	}

	function closeModal() {
		isModalVisible = false;
	}

	function toggleDropdown() {
		dropdownVisible = !dropdownVisible;
	}

	async function handleWalletClick(walletName: string) {
		isModalVisible = false;

		await connect(walletName);
	}

	function handleClickOutside(event) {
		if (
			dropdownElement &&
			buttonElement &&
			!dropdownElement.contains(event.target) &&
			!buttonElement.contains(event.target)
		) {
			dropdownVisible = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

<div class="relative inline-block text-left">
	<button
		bind:this={buttonElement}
		class={buttonClass}
		on:click|preventDefault={$isConnected ? toggleDropdown : openModal}
	>
		{#if $isConnected}
			<div class="flex items-center gap-1">
				<p>Connected</p>
				<img src={$selected?.icon} alt={$selected?.name} class="size-5" />
				<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
					><path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6l-6-6z" /></svg
				>
			</div>
		{:else}
			<div class="flex items-center gap-1">
				Connect Wallet <svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					><path
						fill="currentColor"
						d="M5 13h11.17l-4.88 4.88c-.39.39-.39 1.03 0 1.42c.39.39 1.02.39 1.41 0l6.59-6.59a.996.996 0 0 0 0-1.41l-6.58-6.6a.996.996 0 1 0-1.41 1.41L16.17 11H5c-.55 0-1 .45-1 1s.45 1 1 1"
					/></svg
				>
			</div>
		{/if}
	</button>

	{#if isModalVisible}
		<div
			class="fixed z-10 inset-0 flex items-center justify-center"
			aria-labelledby="modal-title"
			role="dialog"
			aria-modal="true"
		>
			<div
				class="fixed inset-0 backdrop-blur-[2px] bg-opacity-75 transition-opacity"
				aria-hidden="true"
				on:click={closeModal}
			></div>
			<div class={modalClass}>
				{#each $list as [name, walletOption] (name)}
					<div
						class={`${itemClass} text-black flex my-6 md:my-4 justify-center items-center rounded-md`}
					>
						<button
							on:click={() => handleWalletClick(name)}
							on:keydown={() => handleWalletClick(name)}
							class="text-[20px] md:text-[16px] flex capitalize gap-2 w-full items-center justify-center md:justify-start"
						>
							<img src={walletOption.icon} alt={name} class="size-5" />
							{name === 'typhoncip30' ? 'Typhon' : name === 'gerowallet' ? 'Gero' : name}
						</button>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	{#if dropdownVisible}
		<div
			bind:this={dropdownElement}
			class={`${dropdownClass} right-auto`}
			role="menu"
			tabindex="0"
			in:fade={{ duration: 200 }}
			out:fly={{ x: 0, y: 30, duration: 150 }}
		>
			<div class="m-2" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
				{#if $isConnected}
					{#if handleName}
						<div
							class="px-4 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-200 hover:text-gray-900 flex gap-2 text-[16px] items-center"
						>
							Hello, <p class="text-green-700 font-bold -mr-2">$</p>
							{handleName}
						</div>
					{/if}

					{#if fungibleToken}
						<div
							class="px-4 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-200 hover:text-gray-900 flex gap-2 text-[16px] items-center"
						>
							{fungibleToken.assetName}:
							<p>
								{fungibleToken.quantity
									? Number(fungibleToken.quantity).toLocaleString('en-US')
									: '0'}
							</p>
						</div>
					{/if}

					<p class={`${itemClass} rounded-md`}>
						₳ {balance
							? balance.toLocaleString('en-US', {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2
								})
							: '0.00'}
					</p>

					<div class={`${itemClass} hover:bg-red-500 hover:text-white rounded-md inline-block`}>
						<button on:click={disconnect} on:keydown={disconnect}>Disconnect</button>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
