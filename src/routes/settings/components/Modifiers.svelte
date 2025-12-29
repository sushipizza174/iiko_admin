<script lang="ts">
    // @ts-nocheck
    import { beforeUpdate } from "svelte";
    import {_store} from "../../../core/_store"
    import { utils } from "../../../core/utils"
    import { Input } from "$lib/components/ui/input/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import CrossCircled from "svelte-radix/CrossCircled.svelte";
    import Loader from "$lib/components/ui/Loader.svelte";
    import { toast } from "svelte-sonner";
    import * as Dialog from "$lib/components/ui/dialog";
    import PlusCircled from "svelte-radix/PlusCircled.svelte";

    export let edit_site_settings
    export let editProduct

    let products = []
    let modifiers = []
    let modifier_name

    beforeUpdate(()=>{
        products = $_store.products || [];
        Init_SetIems()
    })

    const Init_SetIems = () => {
        if ($_store.load_settings) {
            modifiers = $_store.site_settings.find(s => s.id == 'modifiers')?.data
        }
    }
</script>

<div>
    <p class="font-bold scroll-mt-[70px]" id="modifiers">Модификаторы</p>
    {#if modifiers && modifiers.length > 0}
        {#each modifiers as setting, index}
            <div class="flex space-x-3 items-center">
                <p>{setting?.name}</p>

                <!-- Удалить модификатор -->
                <Dialog.Root>
                    <Dialog.Trigger class="!outline-none"><CrossCircled class="text-red-600 h-5 w-5 ml-1" /></Dialog.Trigger>
                    <Dialog.Content class="sm:max-w-[425px]">
                        <Dialog.Header>
                            <Dialog.Title>Вы уверены, что хотите удалить модификатор {setting.name}?</Dialog.Title>
                            <Dialog.Description>Данное действие невозможно отменить. Модификатор автоматически удалится из всех товаров, в которых он используется.</Dialog.Description>
                          </Dialog.Header>
                          <Dialog.Close class="w-full">
                            <Button 
                                class="w-full"
                                on:click={()=> {
                                    products.map( p => {
                                        if (p.data.modifiers?.some(item => item === setting.name)) {
                                            p.data.modifiers = p.data.modifiers.filter(item => item !== setting.name)
                                            editProduct(p.id, p.data)
                                        }
                                    })

                                    products = [...products];
                                    _store.val('products', products);
                                    edit_site_settings('modifiers', null, index);
                                    toast.success("Успешно!", {
                                        description: `Модификатор "${setting.name}" удален`,
                                        action: { label: "Закрыть",	onClick: () => console.info("") },
                                        position: 'top-right',
                                    })
                                }}
                            >Удалить</Button>
                          </Dialog.Close>
                    </Dialog.Content>
                </Dialog.Root>
            </div>
        {/each}
    {/if}

    <!-- Добавить модификатор -->
    <Popover.Root>
        <Popover.Trigger asChild let:builder class="!outline-none">
            <Button builders={[builder]} variant="outline" class="mt-3"><PlusCircled class="text-gray-400 h-4 w-4 mr-2" /> Добавить</Button>
        </Popover.Trigger>
        <Popover.Content class="w-max" align="start">
            <p class="font-bold mb-1">Добавить</p>
            <div class="flex items-center space-x-2">
                <Input bind:value={modifier_name} placeholder="Название" class="w-32" />
                <Button 
                    disabled={!modifier_name?.trim()}
                    on:click={() => edit_site_settings('modifiers', {name: modifier_name})}>
                    Сохранить
                </Button>
            </div>
        </Popover.Content>
    </Popover.Root>
</div>