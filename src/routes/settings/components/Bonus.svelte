<script lang="ts">
    // @ts-nocheck
    import { beforeUpdate } from "svelte";
    import CaretSort from "svelte-radix/CaretSort.svelte";
    import {_store} from "../../../core/_store"
    import { utils } from "../../../core/utils"
    import { Input } from "$lib/components/ui/input/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import * as Command from "$lib/components/ui/command/index.js";
    import CrossCircled from "svelte-radix/CrossCircled.svelte";
    import Pencil2 from "svelte-radix/Pencil2.svelte";
    import Loader from "$lib/components/ui/Loader.svelte";
    import Check from "svelte-radix/Check.svelte";
    import { cn } from "$lib/utils.js";
    import { tick } from "svelte";
    import { toast } from "svelte-sonner";
    import * as Dialog from "$lib/components/ui/dialog";
    import PlusCircled from "svelte-radix/PlusCircled.svelte";
    import Textarea from "$lib/components/ui/textarea/textarea.svelte";
    import { Label } from "$lib/components/ui/label/index.js";
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";

    export let city_name = ''
    export let city = ''
    export let edit_site_settings

    let edit_setting
    let bonus = []

    let open = {}
    let add_setting = {
        bonus_type: null,
        bonus_title: null,
        bonus_text: null,
        bonus_img: null,
    }

    let img_to_delete = null
    let not_saved_img = []

    beforeUpdate(()=>{
        Init_SetIems()
    })

    const Init_SetIems = () => {
        if ($_store.load_settings) {
            bonus = $_store.site_settings.find(s => s.id == 'bonus')?.data
        }
    }

    // Функция для добавления картинки для редактирования
    async function uploadFileEdit() {
        const file = event.target.files[0]; 
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        edit_setting.img = 'load';

        try {
            // const response = await fetch(`${$_store.api_path}/upload_img?token=${localStorage.getItem('token')}`, {
                const response = await fetch(`https://fudoadmin.ru/api/image?token=${localStorage.getItem('token')}&key=UHCowkgAEk63vXn62LHmYov`, {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            if (result.success) {
                edit_setting.img = result.filename;
                not_saved_img.push(result.filename);
            } else {
                console.error("Failed to upload file");
            }
        } catch (error) {
            console.error("Error:", error);
        } 
    }

    // Функция для добавления картинки для акций и новостей
    async function uploadFileBonus() {
        const file = event.target.files[0]; 
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        add_setting.bonus_img = 'load';

        try {
            // const response = await fetch(`${$_store.api_path}/upload_img?token=${localStorage.getItem('token')}`, {
                const response = await fetch(`https://fudoadmin.ru/api/image?token=${localStorage.getItem('token')}&key=UHCowkgAEk63vXn62LHmYov`, {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            if (result.success) {
                add_setting.bonus_img = result.filename;
                not_saved_img.push(result.filename);
            } else {
                console.error("Failed to upload file");
            }
        } catch (error) {
            console.error("Error:", error);
        } 
    }

    // для закрытия popover
    const closeAndFocusTrigger = (triggerId) => {
        for (const key in open) {
            open[key] = false;
        }
        tick().then(() => { document.getElementById(triggerId)?.focus() });
    }

    const bonus_types = [{name: 'Акции'}, {name: 'Новости'}]
    $: selectedTypeBonusEdit = bonus_types.find(t => t.name == edit_setting?.type)?.name ?? "Тип"
    $: selectedTypeBonus = bonus_types.find(t => t.name == add_setting.bonus_type)?.name ?? "Тип"

</script>

<div class="w-full my-8">
    <p class="font-bold mb-2 scroll-mt-[70px]" id="bonus">Акции и новости {city_name}</p>

    {#if bonus}
        {@const bonus_city = bonus.filter(item => item.city == city) || []}
            {#if bonus_city.length > 0}
                <div class="flex flex-wrap gap-5 mt-5">
                    {#each bonus_city as setting}
                    {@const globalIndex = bonus.findIndex(item => item.id === setting.id)}
                        {#key setting.img} <!-- Ускоряет ререндеринг -->
                            <!-- Редактировать -->
                            <Dialog.Root onOpenChange={(open) => {
                                if (!open) {
                                    not_saved_img?.forEach(img => { utils.deleteImg(img) });
                                    not_saved_img = [];
                                }}}>
                                <div class="flex">
                                    <Dialog.Trigger on:click={() => {edit_setting = { ...setting }; img_to_delete = edit_setting.img}} class="!outline-none flex">
                                        <div class="p-2 shadow-md rounded-md w-[330px] border">
                                            <div class="flex items-center justify-between mb-3 w-full">
                                                <p class="underline">{setting.type}</p>
                                                <Pencil2 class="h-5 w-5" />
                                            </div>

                                            <img src={$_store.imgproxy_path(setting.img, '543', '146')} alt="Картинка {setting.name}" class="rounded-md" />
                                            <p class="text-xs text-wrap break-all text-center">{setting.img}</p>
            
                                            <p class="mt-2 text-start"><span class="font-semibold">Заголовок:</span> {@html setting.title}</p>
                                            <p class="mt-2 text-start"><span class="font-semibold">Текст:</span> {@html setting.text}</p>
                                        </div>
                                    </Dialog.Trigger>
                                </div>
                                <Dialog.Content class="min-w-[600px]">
                                    <Dialog.Header><Dialog.Title>Редактировать</Dialog.Title></Dialog.Header>
                                    <div class="grid">
                                        <div class="flex flex-col gap-2 mt-2">
                                            <Label for="edit_type_bonus">Тип</Label>
                                            <Popover.Root bind:open={open.bonus_type_edit} let:ids>
                                                    <Popover.Trigger asChild let:builder class="w-full !outline-none">
                                                        <Button builders={[builder]} variant="outline" role="combobox" class="w-full font-normal justify-between" id='edit_type_bonus'>
                                                            {selectedTypeBonusEdit}
                                                            <CaretSort class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </Popover.Trigger>
                                                    <Popover.Content class="p-0">
                                                        <ScrollArea class="h-28 rounded-md">
                                                            <Command.Root>
                                                                <Command.Input placeholder="Поиск" class="h-9" />
                                                                <Command.Empty>Не найдено</Command.Empty>
                                                                <Command.Group>
                                                                    {#each bonus_types as type}
                                                                        <Command.Item
                                                                            value={type.name}
                                                                            onSelect={(currentValue) => {
                                                                                edit_setting.type = type.name;
                                                                                closeAndFocusTrigger(ids.trigger);
                                                                            }}
                                                                        >
                                                                            <Check class={cn( "mr-2 h-4 w-4",  edit_setting.type !== type.name && "text-transparent")}  />
                                                                            {type.name}
                                                                        </Command.Item>
                                                                    {/each}
                                                                </Command.Group>
                                                            </Command.Root>
                                                        </ScrollArea>
                                                        
                                                    </Popover.Content>
                                                </Popover.Root>
                                        </div>
                                        <div class="mt-2 gap-2">
                                            <Label for="edit_title_bonus">Заголовок</Label>
                                            <Textarea placeholder="Заголовок" bind:value={edit_setting.title} id="edit_title_bonus" />
                                        </div>
                                        <div class="mt-2 gap-2">
                                            <Label for="edit_text_bonus">Текст</Label>
                                            <Textarea placeholder="Текст" bind:value={edit_setting.text} id="edit_text_bonus" />
                                        </div>
                                        <div class="flex items-center justify-between my-2 mt-4">
                                            {#if edit_setting.img && edit_setting.img !== 'load'}
                                                <p class="ml-3 max-w-[394px] break-words whitespace-normal overflow-wrap-break-word text-wrap">{edit_setting.img}</p>
                                            {:else if edit_setting.img == 'load'}
                                                <div class="scale-[0.5]"><Loader /></div>
                                            {/if}
                        
                                            <label class="cursor-pointer flex items-center" on:change={() => uploadFileEdit()}>
                                                <input type="file" class="absolute inset-0 w-full h-full opacity-0 pointer-events-none" />
                                                <Button variant="outline" class="pointer-events-none">Изменить файл</Button>
                                            </label>
                                        </div>
                                        
                                        <div class="flex justify-between items-center mt-5">
                                            <Dialog.Root>
                                                <Dialog.Trigger>
                                                    <button class="flex items-center underline underline-offset-4 gap-2 text-red-600">
                                                        Удалить <CrossCircled class="h-5 w-5 mt-1" />
                                                    </button>
                                                </Dialog.Trigger>
                                                <Dialog.Content>
                                                    <Dialog.Header>
                                                        <Dialog.Title>Удалить акцию / новость?</Dialog.Title>
                                                        <Dialog.Description>Вы уверены? Это действие невозможно отменить.</Dialog.Description>
                                                    </Dialog.Header>
                                                    <Dialog.Close class="w-full">
                                                        <Button class="w-full" on:click={() => {
                                                            if (globalIndex !== -1) {
                                                                utils.deleteImg(edit_setting.img); // удаляем текущую картинку
                                                                utils.deleteImg(img_to_delete);  // удаляем картинки, на которые была заменена текущая
                                                                img_to_delete = null
                                                                edit_site_settings('bonus', null, globalIndex);
                                                                toast.success("Успешно!", {
                                                                    description: `Изменения сохранены.`,
                                                                    action: { label: "Закрыть",	onClick: () => console.info("") },
                                                                    position: 'top-right',
                                                                })
                                                            } else {
                                                                toast.warning("Ошибка!", {
                                                                    description: `Что-то пошло не так`,
                                                                    action: { label: "Закрыть",	onClick: () => console.info("") },
                                                                    position: 'top-right',
                                                                })
                                                            }
                                                        }}>Удалить</Button>
                                                    </Dialog.Close>
                                                </Dialog.Content>
                                            </Dialog.Root>

                                            <Dialog.Close>
                                                <Button 
                                                    disabled={!edit_setting.type || !edit_setting.text || !edit_setting.img}
                                                    on:click={() => {
                                                        if (globalIndex !== -1) {
                                                            not_saved_img.filter(img => img !== edit_setting.img)?.forEach(img => { utils.deleteImg(img) });
                                                            not_saved_img = [];
                                                            if (img_to_delete !== edit_setting.img) {
                                                                utils.deleteImg(img_to_delete)
                                                            }
                                                            img_to_delete = null;
                                                            edit_site_settings('bonus', {...edit_setting, city}, null, globalIndex);
                                                            toast.success("Успешно!", {
                                                                description: `Изменения сохранены.`,
                                                                action: { label: "Закрыть",	onClick: () => console.info("") },
                                                                position: 'top-right',
                                                            })
                                                        } else {
                                                            toast.warning("Ошибка!", {
                                                                description: `Что-то пошло не так`,
                                                                action: { label: "Закрыть",	onClick: () => console.info("") },
                                                                position: 'top-right',
                                                            })
                                                        }}}>
                                                    Сохранить изменения
                                                </Button>
                                            </Dialog.Close>
                                        </div>
                                        
                                        </div>
                                </Dialog.Content>
                            </Dialog.Root>
                        {/key}
                    {/each}
                </div>
            {/if}
    {/if}
    
    <!-- Добавить -->
    <Popover.Root onOpenChange={(open) => {
        if (!open) {
            not_saved_img?.forEach(img => { utils.deleteImg(img) });
            not_saved_img = [];
            add_setting.bonus_img = null;
        }}}>
        <Popover.Trigger asChild let:builder class="!outline-none">
            <Button builders={[builder]} variant="outline" class="mt-3"><PlusCircled class="text-gray-400 h-4 w-4 mr-2" /> Добавить</Button>
        </Popover.Trigger>
        <Popover.Content class="w-max" align="start">
            <p class="font-bold mb-1">Добавить</p>
            <div class="flex gap-2">
                <Popover.Root bind:open={open.bonus_type} let:ids>
                    <Popover.Trigger asChild let:builder class="w-full !outline-none">
                        <Button builders={[builder]} variant="outline" role="combobox" class="w-full font-normal justify-between">
                            {selectedTypeBonus}
                            <CaretSort class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </Popover.Trigger>
                    <Popover.Content class="p-0">
                        <ScrollArea class="h-28 rounded-md">
                            <Command.Root>
                                <Command.Input placeholder="Поиск" class="h-9" />
                                <Command.Empty>Не найдено</Command.Empty>
                                <Command.Group>
                                    {#each bonus_types as type}
                                        <Command.Item
                                            value={type.name}
                                            onSelect={(currentValue) => {
                                                add_setting.bonus_type = type.name;
                                                closeAndFocusTrigger(ids.trigger);
                                            }}
                                        >
                                            <Check class={cn( "mr-2 h-4 w-4",  add_setting.bonus_type !== type.name && "text-transparent")}  />
                                            {type.name}
                                        </Command.Item>
                                    {/each}
                                </Command.Group>
                            </Command.Root>
                        </ScrollArea>
                        
                    </Popover.Content>
                </Popover.Root>
            </div>
            
            <Input bind:value={add_setting.bonus_title} placeholder="Заголовок" class="mt-2" />
            <Textarea bind:value={add_setting.bonus_text} placeholder="Текст" class="mt-2" />
            <p class="text-sm mt-1">* добавь в текст &lt;br /&gt; для переноса строки в тексте</p>

            <div class="flex items-center gap-5 my-2">
                {#if add_setting.bonus_img && add_setting.bonus_img !== 'load'}
                    <p class="ml-3 break-all">{add_setting.bonus_img}</p>
                {:else if add_setting.bonus_img == 'load'}
                    <div class="scale-[0.5]"><Loader /></div>
                {/if}

                <label class="cursor-pointer" on:change={(e) => {uploadFileBonus()}}>
                    <input type="file" class="absolute inset-0 w-full h-full opacity-0 pointer-events-none" />
                    <Button variant="outline" class="pointer-events-none">
                        <PlusCircled class="text-gray-400 h-4 w-4 mr-2" /> Добавить файл
                    </Button>
                </label>
            </div>
                    
            <Button disabled={!add_setting.bonus_type || !add_setting.bonus_title || !add_setting.bonus_text || !add_setting.bonus_img}
                on:click={() => {
                    const existingIds = bonus?.map(item => item.id) || [];
                    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
                    not_saved_img.filter(img => img !== add_setting.bonus_img)?.forEach(img => { utils.deleteImg(img) });
                    not_saved_img = [];
                    edit_site_settings('bonus', {	
                        id: maxId + 1,
                        city, 
                        type: add_setting.bonus_type, 
                        img: add_setting.bonus_img, 
                        title: add_setting.bonus_title,
                        text: add_setting.bonus_text 
                    })}} >
                Сохранить
            </Button>
        </Popover.Content>
    </Popover.Root>
</div>