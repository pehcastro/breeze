<script lang="ts" type="module">
  import { useCardanoWallet } from "$lib/store";
  import ModalWallet from "$lib/components/modalwallet/modalWallet.svelte";
  import DropdownWallet from "$lib/components/dropdownwallet/dropdownWallet.svelte";

  const { list, connect, isConnected, wallet, selected, disconnect } = useCardanoWallet;
  

  let balance: any;
  let networkId: number | undefined;
  let handleName: string;

  $: if ($wallet) {
    $wallet.getAssets('handles').then(assets => {
      if (assets.length > 0) {
        handleName = `$${assets[0].assetName}`;
      }

          $wallet.getNetworkId().then(id => {
      networkId = id;
    });


        $wallet?.getAssets('ada').then(ada => {
      balance = ada;
    });

    });
  }
  

  async function handleWalletClick(walletName: string) {
    await connect(walletName);
  }


   async function getBalanceCbor() {
    if ($wallet) {
      balance = await $wallet.getBalance();
      console.log('balance cbor', balance);
    }
  }

  async function getChangeAddress() {
    if ($wallet) {
      const changeAddress = await $wallet.getChangeAddress();
      console.log(changeAddress);
    }
  }

  async function getCollateral() {
    if ($wallet) {
      const collateral = await $wallet.getCollateral();
      console.log(collateral);
    }
  }

  async function getUsedAddresses() {
    if ($wallet) {
      const usedAddresses = await $wallet.getUsedAddresses();
      console.log('used address', usedAddresses);
    }
  }

  async function getUtxos () {
    if ($wallet) {
      const utxos = await $wallet.getUtxos();
      console.log('Utxos', utxos);
    }
  }

    async function getAddress () {
    if ($wallet) {
      const address = await $wallet.getAddress('bech32');
      console.log('addr value', address);
    }
  }

      async function getAddressCbor () {
    if ($wallet) {
      const address = await $wallet.getAddress('cbor');
      console.log('addr value', address);
    }
  }

        async function getAddressBytes () {
    if ($wallet) {
      const address = await $wallet.getAddress('bytes');
      console.log('addr value', address);
    }
  }


      async function getStakeKey () {
    if ($wallet) {
      const stakekey = await $wallet.getAddress('stakekey');
      console.log('stake addr', stakekey);
    }
  }

        async function getStakeHexKey () {
    if ($wallet) {
      const stakekey = await $wallet.getAddress('stakehex');
      console.log('stake hex', stakekey);
    }
  }


          async function getLovelaces () {
    if ($wallet) {
      const stakekey = await $wallet.getAssets('lovelace');
      console.log('lovelace', stakekey);
    }
  }

            async function getAda () {
    if ($wallet) {
      const stakekey = await $wallet.getAssets('ada');
      console.log('ada', stakekey);
    }
  }

            async function getAssets () {
    if ($wallet) {
      const stakekey = await $wallet.getAssets('asset');
      console.log('assets', stakekey);
    }
  }
 
             async function getNfts () {
    if ($wallet) {
      const stakekey = await $wallet.getAssets('nft');
      console.log('nfts', stakekey);
    }
  }

               async function getFts () {
    if ($wallet) {
      const stakekey = await $wallet.getAssets('ft');
      console.log('fts', stakekey);
    }
  }

                 async function getHandles () {
    if ($wallet) {
      const stakekey = await $wallet.getAssets('handles');
      console.log('handle list', stakekey);
    }
  }

                   async function getFromPolicy () {
    if ($wallet) {
      const policyID = "01d63b5dc783794a49d8369ec754306660c6ef1c18310c1ceb350b28"
      const stakekey = await $wallet.getAssets('policy', policyID);
      console.log('nfts from this policy', stakekey);
    }
  }

  async function getAuthorization() {
    if ($wallet) {
      const addr = await $wallet.getAddress('stakehex');
      const payload = "some data to sign";
      const dataSignature = await $wallet.getAuthorization(addr, payload);
      console.log("Signature:", dataSignature.signature);
      console.log("Key:", dataSignature.key);
    }
  }

async function testTransaction() {

    try {
      // Build the transaction
      const txHash = await $wallet.buildTransaction('addr1qxqxc09qqzwuu08f45tj0xwl6a7s25mezycq5yaylvrj6u494s48dzy2fqjejt82pyl56qf9xfhtalxgh6ngarztsnpsqzzm3a', 55000000);
      console.log("Transaction hash:", txHash);

      // Sign the transaction
      const signedTx = await $wallet.signTransaction(txHash);
      console.log("Signed transaction:", signedTx);

      // Submit the transaction
      const txId = await $wallet.submitTransaction(signedTx);
      console.log("Transaction ID:", txId);
    } catch (error) {
      console.error("Error testing transaction:", error);
    }
  }


</script>


<div class="m-4"> 
<p class="font-bold my-4"> Modal Wallet </p>
<ModalWallet/>
</div>
<div class="m-4"> 
<p class="font-bold my-4"> Dropdown Wallet </p>
<DropdownWallet displayToken={true} policyID="a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235" />
</div>


<!-- {#each $list as [name, walletOption]}
  <button on:click={() => handleWalletClick(name)} class="flex border p-4 m-2 capitalize gap-2">
    <img src={walletOption.icon} alt={name} class="size-5"/>
        {name} 
  </button>
{/each}
-->

<!-- {#if $isConnected}
<div class="my-10">
  <button on:click={disconnect} class="bg-red-500 text-white p-4 rounded">Disconnect </button>
</div>
{/if}  -->

<p class="mt-5">{$isConnected ? 'Connected' : 'Not connected'}</p>
<p>User Handle.me: {handleName}</p>
<p>Network ID: {networkId}</p>
<p>Wallet Name: {$selected?.name}</p>
<div>Balance: {balance}</div>
<div class="grid gap-4 grid-cols-5">
<button on:click={getBalanceCbor} class="bg-blue-500 text-white p-4 rounded">Get Balance</button>
<button on:click={getChangeAddress} class="bg-blue-500 text-white p-4 rounded">Get Change Address</button>
<button on:click={getCollateral} class="bg-blue-500 text-white p-4 rounded">Get Collateral</button>
<button on:click={getUsedAddresses} class="bg-blue-500 text-white p-4 rounded">Get Used Addresses</button>
<button on:click={getUtxos} class="bg-blue-500 text-white p-4 rounded">Get Utxos</button>
<button on:click={getAddress} class="bg-green-500 text-white p-4 rounded">Get Address</button>
<button on:click={getAddressCbor} class="bg-green-700 text-white p-4 rounded">Get Address cbor</button>
<button on:click={getAddressBytes} class="bg-green-800 text-white p-4 rounded">Get Address Bytes</button>
<button on:click={getStakeKey} class="bg-yellow-500 text-white p-4 rounded">Get StakeKey</button>
<button on:click={getStakeHexKey} class="bg-orange-800 text-white p-4 rounded">Get StakeHex</button>
<button on:click={getLovelaces} class="bg-orange-500 text-white p-4 rounded">Get Lovelaces</button>
<button on:click={getAda} class="bg-orange-600 text-white p-4 rounded">Get Ada</button>
<button on:click={getAssets} class="bg-orange-700 text-white p-4 rounded">Get Assets</button>
<button on:click={getNfts} class="bg-orange-900 text-white p-4 rounded">Get Nfts</button>
<button on:click={getFts} class="bg-orange-400 text-white p-4 rounded">Get Fts</button>
<button on:click={getHandles} class="bg-red-600 text-white p-4 rounded">Get Handles</button>
<button on:click={getFromPolicy} class="bg-red-300 text-white p-4 rounded">Get From Policy</button>
<button on:click={getAuthorization} class="bg-blue-500 text-white p-4 rounded">Get Authorization</button>
<button on:click={testTransaction} class="bg-blue-500 text-white p-4 rounded">Test Transaction</button>
</div>



