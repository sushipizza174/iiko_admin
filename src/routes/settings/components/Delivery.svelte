<script lang="ts">
    // @ts-nocheck
    import { _site_settings} from "$lib/store.svelte.js"
    import { Input } from "$lib/components/ui/input/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import * as Command from "$lib/components/ui/command/index.js";
    import { XCircle, PlusCircle, Pencil, ChevronsUpDown, Check } from "@lucide/svelte";    
    import Loader from "$lib/components/ui/Loader.svelte";
    import { cn } from "$lib/utils.js";
    import { tick } from "svelte";
    import { toast } from "svelte-sonner";
    import * as Dialog from "$lib/components/ui/dialog";
    import Textarea from "$lib/components/ui/textarea/textarea.svelte";
    import { Label } from "$lib/components/ui/label/index.js";
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";

   let {
		city_name = '',
		city = '',
		edit_site_settings
	} = $props();

    let edit_setting = $state({})
    const delivery_types = [{name: 'Доставка'}, {name: 'Самовывоз'}]
    let select_type = $derived(delivery_types.find(t => t.name == edit_setting?.type)?.name ?? "Тип доставки")
    let select_type_add = $derived(delivery_types.find(t => t.name == add_setting?.delivery_type)?.name ?? "Тип доставки")
    let open;
    let open_delivery_type = $state(false)
    let open_delivery_type_edit = $state(false)

    let add_setting = $state({
        delivery_type: null,
        delivery_title: null,
        delivery_add_info: null,
    })

    let img_to_delete = []
    let info = $state([{ text: "" }]);
    let items = [{ min_sum: '', price: '', uuid: ''}]
   
    let delivery = $derived(
        Array.isArray(_site_settings?.list)
            ? _site_settings.list.find(s => s.id == 'delivery_iiko')?.data ?? []
            : []
    );
    let zones = [
        {id: 0, label: 'город'},
        {id: 1, label: 'отдалённые районы'},
    ]
    
</script>

<div class="w-full my-8">
    <p class="font-bold mb-2 scroll-mt-[70px]" id="delivery">Информация о доставке {city_name}</p>

    {#if delivery}
        {@const delivery_city = delivery.filter(d => d.city == city) || []}
            {#if delivery_city.length > 0}
                <div class="flex  gap-5 flex-wrap mt-5 mb-10">
                    {#each delivery_city as setting}
                    {@const global_index = delivery.findIndex(item => item.id === setting.id)}
                        <!-- Редактировать -->
                        <Dialog.Root>
                            <div class="flex">
                            <Dialog.Trigger 
                                onclick={() => {
                                    edit_setting = { ...setting };
                                    // if ((!edit_setting.items || edit_setting.items?.length == 0) && edit_setting.type == 'Доставка') {
                                    //     edit_setting.items = [{}]
                                    // }
                                }} 
                                class="!outline-none flex">
                                <div class="flex flex-col items-start p-2 shadow-md rounded-md w-[340px] border h-full">
                                    <div class="flex justify-between gap-2 mb-2 w-full">
                                        <p class="underline">{setting.type}</p>
                                        <Pencil class="h-5 w-5" />
                                    </div>

                                    <div class="flex flex-col max-w-80 text-start">
                                        <p class="text-green-600">{setting.title}</p>
                                        {#each setting.info as info}
                                            <p>{info.text ?? ''}</p>
                                        {/each}
                                        <p class="text-gray-400 text-sm">{setting.add_info ?? ''}</p>
                                    </div>
                                </div>
                            </Dialog.Trigger>
                        </div>
                            <Dialog.Content>
                            <Dialog.Header><Dialog.Title>Редактировать</Dialog.Title></Dialog.Header>
                                <ScrollArea class={ edit_setting.info?.length > 5 ? 'h-[80vh]' : ''}>
                                    <!-- <ScrollArea class='{(edit_setting.items?.length > 2 || edit_setting.info?.length > 5) ? 'h-[80vh]' : ''}'> -->
                                    <div class="grid px-1">
                                        <div class="flex flex-col gap-2 mt-2">
                                            <Label for="edit_type_delivery">Тип доставки</Label>
                                            <Popover.Root bind:open={open_delivery_type_edit}>
                                                <Popover.Trigger asChild class="w-full !outline-none">
                                                    <Button variant="outline" role="combobox" class="w-full font-normal justify-between" id="edit_type_delivery" >
                                                        {select_type}
                                                        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </Popover.Trigger>
                                                <Popover.Content class="p-0 w-[calc(100%-48px)]">
                                                    <ScrollArea class="h-36 rounded-md">
                                                        <Command.Root>
                                                            <Command.Input placeholder="Поиск" class="h-9" />
                                                            <Command.Empty>Не найдено</Command.Empty>
                                                            <Command.Group>
                                                                {#each delivery_types as type}
                                                                    <Command.Item
                                                                        value={type.name}
                                                                        onSelect={() => {
                                                                            edit_setting.type = type.name;
                                                                            open_delivery_type_edit = false
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
                                            <Label for="edit_title_delivery">Заголовок (зелёный шрифт)</Label>
                                            <Input placeholder="Заголовок" bind:value={edit_setting.title} id="edit_title_delivery" />
                                        </div>
                                        <div class="mt-2 gap-2">
                                            <Label for="edit_add_info_delivery">Доп.информация (серый мелкий шрифт)</Label>
                                            <Input placeholder="Текст" bind:value={edit_setting.add_info} id="edit_add_info_delivery" />
                                        </div>


                                        <Label class="mt-4">Основная информация</Label>
                                        {#each edit_setting.info as item}
                                            <Input bind:value={item.text} class="mt-2" />
                                        {/each}
                                        <Button variant="outline" onclick={() => edit_setting.info = [...edit_setting.info, { text: "" }]} class="mt-2">
                                            <PlusCircle class="text-gray-400 h-5 w-5 mr-2" /> Добавить информацию
                                        </Button>


                                        <!-- {#if edit_setting.type == 'Доставка'}
                                            <Label class="mt-4 mb-2">Uuid доставок</Label>
                                            {#each edit_setting.items as item}
                                                <div class="border p-4 rounded-md mt-2">
                                                    <div class="flex justify-between gap-2 *:w-full *:flex *:flex-col *:gap-2">
                                                        <div>
                                                            <Label>Мин. сумма</Label>
                                                            <Input bind:value={item.min_sum} type="number" on:input={(event) => item.min_sum = event.target.value.replace(/[^A-Za-z0-9_-]/g, '')} />
                                                        </div>
            
                                                        <div>
                                                            <Label>Макс. сумма (не обязательно)</Label>
                                                            <Input bind:value={item.max_sum} type="number" on:input={(event) => item.max_sum = event.target.value.replace(/[^A-Za-z0-9_-]/g, '')} />
                                                        </div>
            
                                                        <div>
                                                            <Label>Цена доставки</Label>
                                                            <Input bind:value={item.price} type="number" on:input={(event) => item.price = event.target.value.replace(/[^A-Za-z0-9_-]/g, '')} />
                                                        </div>
                                                    </div>
            
                                                    <div class="flex flex-col gap-2 mt-2">
                                                        <Label>UUID доставки</Label>
                                                        <Input bind:value={item.uuid}  />
                                                    </div>
                                                </div>
                                            {/each}
                                            <Button variant="outline" on:click={() => edit_setting.items = [...edit_setting.items, { }]} class="mt-2">
                                                <PlusCircle class="text-gray-400 h-5 w-5 mr-2" /> Добавить информацию
                                            </Button>
                                        {/if} -->

                                        
                                        <div class="flex justify-between items-center mt-5">
                                            <Dialog.Root>
                                                <Dialog.Trigger>
                                                    <button class="flex items-center underline underline-offset-4 gap-2 text-red-600">
                                                        Удалить <XCircle class="h-5 w-5 mt-1" />
                                                    </button>
                                                </Dialog.Trigger>
                                                <Dialog.Content>
                                                    <Dialog.Header>
                                                        <Dialog.Title>Удалить информацию?</Dialog.Title>
                                                        <Dialog.Description>Вы уверены? Данное действие невозможно отменить.</Dialog.Description>
                                                    </Dialog.Header>
                                                    <Button onclick={() => {
                                                        if (global_index !== -1) {edit_site_settings('delivery_iiko', null, global_index); info = [{ text: "" }] }
                                                    }}>Удалить</Button>
                                                </Dialog.Content>
                                            </Dialog.Root>
    
                                            <Dialog.Close>
                                                <Button 
                                                    disabled={!edit_setting.title || !edit_setting.type}
                                                    onclick={() => {
                                                        if (global_index !== -1) {
                                                            edit_site_settings('delivery_iiko', {...edit_setting, city}, null, global_index)
                                                            info = [{ text: "" }] 
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
                                </ScrollArea>
                            </Dialog.Content>
                        </Dialog.Root>
                    {/each}
                </div>
            {/if}
    {/if}
    
    <!-- Добавить информацию о доставке -->
    <Popover.Root>
        <Popover.Trigger asChild class="!outline-none">
            <Button variant="outline"><PlusCircle class="text-gray-400 h-4 w-4 mr-2" /> Добавить</Button>
        </Popover.Trigger>
        <Popover.Content class="w-[400px]" align="start">
            <p class="font-bold mb-1">Добавить</p>
                <div class="flex flex-col gap-2 my-2">
                    <Popover.Root bind:open={open_delivery_type}>
                        <Popover.Trigger asChild class="w-full !outline-none">
                            <Button variant="outline" role="combobox" class="w-full font-normal justify-between">
                                {select_type_add}
                                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </Popover.Trigger>
                        <Popover.Content class="p-0">
                            <ScrollArea class="h-28 rounded-md">
                                <Command.Root>
                                    <Command.Input placeholder="Поиск" class="h-9" />
                                    <Command.Empty>Не найдено</Command.Empty>
                                    <Command.Group>
                                        {#each delivery_types as type}
                                            <Command.Item
                                                value={type.name}
                                                onSelect={() => {
                                                    add_setting.delivery_type = type.name;
                                                    open_delivery_type = false
                                                }}
                                            >
                                                <Check class={cn( "mr-2 h-4 w-4",  add_setting.delivery_type !== type.name && "text-transparent")}  />
                                                {type.name}
                                            </Command.Item>
                                        {/each}
                                    </Command.Group>
                                </Command.Root>
                            </ScrollArea>
                        </Popover.Content>
                    </Popover.Root>

                    <Input bind:value={add_setting.delivery_title} placeholder="Заголовок (зелёный шрифт)" />
                    <Input bind:value={add_setting.delivery_add_info} placeholder="Доп. информация (серый мелкий шрифт)" />

                    <div class="flex items-start gap-2">
                        <div class="flex-col w-full">
                            {#each info as item, index}
                                <Input bind:value={item.text} placeholder="Введите одну строку основного текста" class="mb-2" />
                            {/each}
                        </div>
                        <button onclick={() => info = [...info, { text: "" }]}>
                            <PlusCircle class="text-gray-400 h-5 w-5 mr-2 mt-2" />
                        </button>
                    </div>
                </div>
                
                    
                <Button 
                    disabled={!add_setting.delivery_type || !add_setting.delivery_title}
                    onclick={() => {
                        const existingIds = delivery?.map(item => item.id) || [];
                        const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
                        edit_site_settings('delivery_iiko', {
                            id: maxId + 1,
                            city,
                            type: add_setting.delivery_type, 
                            title: add_setting.delivery_title, 
                            add_info: add_setting.delivery_add_info, 
                            info: info
                        })
                        info = [{ text: "" }] }} >
                    Сохранить
                </Button>
        </Popover.Content>
    </Popover.Root>
</div>