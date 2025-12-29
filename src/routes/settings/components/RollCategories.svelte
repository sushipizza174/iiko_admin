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
    import { Label } from "$lib/components/ui/label/index.js";
    import Pencil2 from "svelte-radix/Pencil2.svelte";

    export let edit_site_settings

    let products = []
    let roll_categories = []
    let edit_setting

    let roll_category;
    let roll_category_label;

    beforeUpdate(()=>{
        Init_SetIems()
    })

    const Init_SetIems = () => {
        if ($_store.load_settings) {
            roll_categories = $_store.site_settings.find(s => s.id == 'roll_categories')?.data
        }
    }
</script>



<div class="w-full my-8">
    <p class="font-bold mb-2 scroll-mt-[70px]" id="roll_categories">Категории роллов</p>
    <div class="grid grid-cols-3">
        {#if roll_categories && roll_categories.length > 0}
            {#each roll_categories as category, index_category}
                <!-- Редактировать категорию роллов -->
                <Dialog.Root>
                    <div class="flex">
                        <Dialog.Trigger on:click={() => edit_setting = { ...category }} class="!outline-none">
                            <div class="flex items-center space-x-3">
                                <p>{category.name} ({category.label})</p>
                                <Pencil2 class="h-5 w-5" />
                            </div>
                        </Dialog.Trigger>
                    </div>
                    <Dialog.Content>
                      <Dialog.Header>
                        <Dialog.Title>Редактировать</Dialog.Title>
                        <div class="grid">
                            <div class="flex flex-col gap-2 mt-2">
                                <Label for="edit_name_roll_category">Название категории</Label>
                                <Input bind:value={edit_setting.name} id="edit_name_roll_category" />
                            </div>
                            <div class="mt-2 gap-2">
                                <Label for="edit_lat">Название категории на латинице</Label>
                                <Input 
                                    bind:value={edit_setting.label} 
                                    id="edit_lat"
                                    on:input={(event) => edit_setting.label = event.target.value.replace(/[^A-Za-z0-9_-]/g, '')} />
                            </div>
                            
                            
                            <div class="flex justify-between items-center mt-5">
                                <Dialog.Root>
                                    <Dialog.Trigger>
                                        <button 
                                            class="flex items-center underline underline-offset-4 gap-2 text-red-600" >
                                            Удалить <CrossCircled class="h-5 w-5 mt-1" />
                                        </button>
                                    </Dialog.Trigger>
                                    <Dialog.Content>
                                        <Dialog.Header>
                                              <Dialog.Title>Удалить</Dialog.Title>
                                            <Dialog.Description>Вы уверены? Данное действие невозможно отменить.</Dialog.Description>
                                        </Dialog.Header>
                                        <Button on:click={() => edit_site_settings('roll_categories', null, index_category)}>
                                            Удалить
                                        </Button>
                                    </Dialog.Content>
                                </Dialog.Root>
                                    
                                <Dialog.Close>
                                    <Button 
                                        disabled={!edit_setting.name?.trim() || !edit_setting.label?.trim()}
                                        on:click={() => edit_site_settings('roll_categories', edit_setting, null, index_category)}>
                                        Сохранить изменения
                                    </Button>
                                </Dialog.Close>
                            </div>
                        </div>
                      </Dialog.Header>
                    </Dialog.Content>
                </Dialog.Root>
            {/each}
        {/if}
    </div>
    
    <!-- Добавить категорию роллов -->
    <Popover.Root>
        <Popover.Trigger asChild let:builder class="!outline-none">
            <Button builders={[builder]} variant="outline" class="mt-3"><PlusCircled class="text-gray-400 h-4 w-4 mr-2" /> Добавить</Button>
        </Popover.Trigger>
        <Popover.Content class="w-max" align="start">
            <p class="font-bold mb-1">Добавить</p>
            <div class="*:flex *:items-center space-y-3">
                <div>
                    <p class="w-80">Название категории:</p>
                    <Input 
                        bind:value={roll_category} placeholder="Название" class="w-32" />
                </div>

                <div>
                    <p class="w-80">Название на латинице без пробелов:</p>
                    <Input 
                        bind:value={roll_category_label} 
                        placeholder="Название (лат)" class="w-32"
                        on:input={(event) => roll_category_label = event.target.value.replace(/[^A-Za-z0-9_-]/g, '')}  />
                </div>
                <Button 
                    disabled={!roll_category?.trim() || !roll_category_label?.trim()}
                    on:click={() => edit_site_settings('roll_categories', {name: roll_category, label: roll_category_label})}>
                    Сохранить
                </Button>
            </div>
        </Popover.Content>
    </Popover.Root>
</div>