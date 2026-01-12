<script lang="ts">
    // @ts-nocheck
    import { beforeUpdate } from "svelte";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import * as Command from "$lib/components/ui/command/index.js";
    import { XCircle, PlusCircle, Pencil } from "@lucide/svelte";    
    import Loader from "$lib/components/ui/Loader.svelte";
    import { cn } from "$lib/utils.js";
    import { tick } from "svelte";
    import { toast } from "svelte-sonner";
    import * as Dialog from "$lib/components/ui/dialog";
    import Textarea from "$lib/components/ui/textarea/textarea.svelte";
    import { Label } from "$lib/components/ui/label/index.js";
    import {_config, _site_settings} from "$lib/store.svelte.js"
    import { helpers } from "$lib/helpers.js"

    export let city_name = ''
    export let city = ''
    export let edit_site_settings

    let edit_setting
    let attention_bonus = []
    let attention_bonus_text

    beforeUpdate(()=>{
        init_site_settings()
    })

    const init_site_settings = () => {
        if (_site_settings.loading) {
            attention_bonus = _site_settings.list.find(s => s.id == 'attention_bonus')?.data
        }
    }

</script>

<div class="w-full my-8">
    <p class="font-bold mb-2 scroll-mt-[70px]" id="attention_bonus">Блок "Внимание" для акций {city_name}</p>

    {#if attention_bonus}
        {@const attention_bonus_city = attention_bonus.filter(item => item.city == city) || []}
            {#if attention_bonus_city.length > 0}
                <div class="flex flex-wrap gap-10">
                    {#each attention_bonus_city as setting}
                    {@const globalIndex = attention_bonus.findIndex(item => item.id === setting.id)}
                        <!-- Редактировать -->
                        <Dialog.Root>
                            <div class="flex">
                                <Dialog.Trigger on:click={() => edit_setting = { ...setting }} class="!outline-none flex">
                                    <div class="flex gap-2 items-start justify-between p-2 shadow-md rounded-md w-[340px] border text-start">
                                        <p><span class="font-semibold">Текст:</span> {@html setting.text}</p>
                                        <Pencil class="h-5 w-5 flex-shrink-0" />
                                    </div>
                                </Dialog.Trigger>
                            </div>
                            <Dialog.Content>
                                  <Dialog.Header>
                                    <Dialog.Title>Редактировать</Dialog.Title>
                                    <div class="grid">
                                        <div class="mt-2 gap-2">
                                            <Label for="edit_text">Текст</Label>
                                            <Textarea placeholder="Текст" bind:value={edit_setting.text} id="edit_text" />
                                        </div>
                                        
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
                                                        <Dialog.Description>Вы уверены? Это действие невозможно отменить.</Dialog.Description>
                                                    </Dialog.Header>
                                                    <Dialog.Close class="w-full">
                                                        <Button class="w-full" on:click={() => {
                                                            if (globalIndex !== -1) {
                                                                edit_site_settings('attention_bonus', null, globalIndex);
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
                                                    disabled={!edit_setting.text}
                                                    on:click={() => {
                                                        if (globalIndex !== -1) {
                                                            edit_site_settings('attention_bonus', {...edit_setting, city}, null, globalIndex);
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
                                  </Dialog.Header>
                            </Dialog.Content>
                        </Dialog.Root>
                    {/each}
                </div>
            {/if}
    {/if}
    
    <!-- Добавить -->
    <Popover.Root>
        <Popover.Trigger asChild let:builder class="!outline-none">
            <Button builders={[builder]} variant="outline" class="mt-3"><PlusCircle class="text-gray-400 h-4 w-4 mr-2" /> Добавить</Button>
        </Popover.Trigger>
        <Popover.Content class="w-max" align="start">
            <p class="font-bold mb-1">Добавить</p>
            <Textarea bind:value={attention_bonus_text} placeholder="Текст" class="my-2 w-96" />
            <!-- <p class="text-sm mt-1">* добавь в текст &lt;br /&gt; для переноса строки в тексте</p> -->
                    
            <Button disabled={ !attention_bonus_text}
                on:click={() => {
                    const existingIds = attention_bonus?.map(item => item.id) || [];
                    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
                    edit_site_settings('attention_bonus', {	
                        id: maxId + 1,
                        city, 
                        text: attention_bonus_text 
                    })}} >
                Сохранить
            </Button>
        </Popover.Content>
    </Popover.Root>
</div>