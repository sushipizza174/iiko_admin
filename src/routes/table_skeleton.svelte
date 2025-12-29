<script>
    import { Skeleton } from "$lib/components/ui/skeleton";
    import * as Table from "$lib/components/ui/table/index.js";
    import Loader from "$lib/components/ui/Loader.svelte";
    let table = Array.from({length: 16}, (_, index) => index);
    let cols = Array.from({length: 9}, (_, index) => index);
</script>
<Table.Root> 
        <Table.Header>
            <Table.Row class="cursor-default mx-4 my-2">
                <Table.Head>Изображение</Table.Head>
                <Table.Head>Название</Table.Head>
                <Table.Head>Группа</Table.Head>
                <Table.Head>Описание</Table.Head>
                <Table.Head>SEO-заголовок</Table.Head>
                <Table.Head>Meta описание</Table.Head>
                <Table.Head>Состав</Table.Head>
                <Table.Head>Метки</Table.Head>
                <!-- <Table.Head>Модификаторы</Table.Head> -->
                <Table.Head></Table.Head>
            </Table.Row>
        </Table.Header>
    <Table.Body>
    {#each table as item }
        <Table.Row>
            {#each cols as col }
            <Table.Cell><Skeleton class="h-[30px] w-auto" /></Table.Cell>
            {/each}
        </Table.Row>
    {/each}
    </Table.Body>
    <div class="w-full h-full flex flex-col justify-center items-center absolute top-0 left-0">
        <Loader/>
    </div>
</Table.Root>