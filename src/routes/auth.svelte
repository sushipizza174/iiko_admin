<script lang="js">
    import { post } from "$lib/server";
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { _auth } from "$lib/store.svelte.js";
    import Logo from "$lib/components/ui/logo.svelte";
    import { onMount } from "svelte";

    let login = $state("");
    let pass = $state("");
    let token = $state("");
    
    onMount(() => {
        token = localStorage.getItem('token')
        check_token()
    })

    const auth_user = async (e) => {
        e.preventDefault();
        _auth.auth_error = "";
        try {
            const data = await post("auth", { login, pass });
            if (data.error) throw new Error(data.error);
            if (!data.token) throw new Error(data.message || "Токен не получен");
            login = "";
            pass = "";
            init_user(data);
        } catch (e) {
            _auth.auth_error = e.message || "Ошибка входа";
        }
    };

    const check_token = async () => {
        if(token){
            const data = await post("auth", {token});

            if (data.result == false) {
                localStorage.removeItem('token')
                location.reload()
            } else {
                init_user(data)
            }
        }
    }

    const init_user = (data) => {
        localStorage.setItem('token', data.token)
        _auth.user = data
        if (data.active) _auth.is_authenticated = true
    }
</script>

<main class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="h-2/3 w-full flex justify-center items-center flex-col">

        <div class="py-3">
            <Logo/>
        </div>
        <h1 class="text-3xl font-bold">SushiPizza</h1>
        <h1 class="text-3xl font-bold">Управление и Статистика</h1>

        <Card.Root class="w-full max-w-sm mt-2">
            <Card.Header>
                <Card.Title>Войти</Card.Title>
                <Card.Description>Введите свои данные</Card.Description>
            </Card.Header>
            <form onsubmit={auth_user}>
                <Card.Content class="space-y-4">
                    <div class="grid gap-2">
                        <Label>Логин</Label>
                        <Input type="text" bind:value={login}  />
                    </div>
                    <div class="grid gap-2">
                        <Label>Пароль</Label>
                        <Input type="password" bind:value={pass}  />
                    </div>
                    {#if _auth.auth_error}
                        <p class="text-sm text-destructive">{_auth.auth_error}</p>
                    {/if}
                </Card.Content>
                <Card.Footer>
                    <Button type="submit" class="w-full mt-6">Войти</Button>
                </Card.Footer>
            </form>
        </Card.Root>
    </div>
</main>
