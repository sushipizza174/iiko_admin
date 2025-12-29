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
    let marks = []
    let mark_name
    let mark_img

    beforeUpdate(()=>{
        products = $_store.products || [];
        Init_SetIems()
    })

    const Init_SetIems = () => {
        if ($_store.load_settings) {
            marks = $_store.site_settings.find(s => s.id == 'marks')?.data
        }
    }

    // Функция для добавления картинки Пометка для товара
    async function uploadFileMark() {
        const file = event.target.files[0]; 
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        mark_img = 'load';

        try {
            // const response = await fetch(`${$_store.api_path}/upload_img?token=${localStorage.getItem('token')}`, {
            const response = await fetch(`https://fudoadmin.ru/api/image?token=${localStorage.getItem('token')}&key=UHCowkgAEk63vXn62LHmYov`, {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            if (result.success) {
                mark_img = result.filename;
            } else {
                console.error("Failed to upload file");
            }
        } catch (error) {
            console.error("Error:", error);
        } 
    }
</script>

<div>
    <p class="font-bold mb-2 scroll-mt-[70px]" id="marks">Метки</p>

    {#if marks && marks.length > 0}
        {#each marks as setting, index}
            <div class="flex space-x-3 items-center">
                <!-- <img src={$_store.imgproxy_path(setting.img, '100',  '100')} alt="Метка {setting.name}" class="w-7 h-7" />
                <p>-</p> -->
                <p>{setting.name}</p>

                <!-- Удалить метку -->
                <Dialog.Root>
                    <Dialog.Trigger class="!outline-none"><CrossCircled class="text-red-600 h-5 w-5 ml-1" /></Dialog.Trigger>
                    <Dialog.Content class="sm:max-w-[425px]">
                        <Dialog.Header>
                            <Dialog.Title>Вы уверены, что хотите удалить метку {setting.name}?</Dialog.Title>
                            <Dialog.Description>Данное действие невозможно отменить. Метка автоматически удалится из всех товаров, в которых она используется.</Dialog.Description>
                          </Dialog.Header>
                          <Dialog.Close class="w-full">
                            <Button 
                                class="w-full"
                                on:click={()=> {
                                    products.map( p => {
                                        if (p.data.mark?.some(item => item === setting.name)) {
                                            p.data.mark = p.data.mark.filter(item => item !== setting.name)
                                            editProduct(p.id, p.data)
                                        }
                                    })

                                    products = [...products];
                                    _store.val('products', products);
                                    edit_site_settings('marks', null, index);
                                    utils.deleteImg(setting.img); 
                                    toast.success("Успешно!", {
                                        description: `Метка "${setting.name}" удалена`,
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

    <!-- Добавить метку -->
    <Popover.Root>
        <Popover.Trigger asChild let:builder class="!outline-none">
            <Button builders={[builder]} variant="outline" class="mt-3"><PlusCircled class="text-gray-400 h-4 w-4 mr-2" /> Добавить</Button>
        </Popover.Trigger>
        <Popover.Content class="w-max" align="start">
            <p class="font-bold mb-1">Добавить</p>
            <div class="flex items-center flex-wrap gap-2">
                <Input bind:value={mark_name} placeholder="Название (new)" class="w-32" />

                <!-- {#if mark_img && mark_img !== 'load'}
                    <p class="ml-3">{mark_img}</p>
                {:else if mark_img == 'load'}
                    <div class="scale-[0.5]"><Loader /></div>
                {/if}

                <label class="cursor-pointer" on:change={() => uploadFileMark()}>
                    <input type="file" class="absolute inset-0 w-full h-full opacity-0 pointer-events-none" />
                    <Button variant="outline" class="pointer-events-none">
                        <PlusCircled class="text-gray-400 h-4 w-4 mr-2" /> Добавить файл
                    </Button>
                </label> -->
                
                <Button 
                    disabled={!mark_name?.trim()}
                    on:click={() => edit_site_settings('marks', {name: mark_name})}>
                    Сохранить
                </Button>
            </div>
        </Popover.Content>
    </Popover.Root>
</div>