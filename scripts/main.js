async function buscarPalavraAleatoria(){
    const resposta = await fetch('https://api.dicionario-aberto.net/random')
        .then(resposta => resposta.json())
        .then(dados => dados.word)
        .catch(erro => {console.log(erro); return "ERRO!!";});
    return resposta;
}

var palavraAleatoria;
var entradas = [];

let botaoReiniciar = document.querySelector(".botao-circulo-header");

let botaoAvaliar = document.getElementById("botao-avaliar");

let camposEntrada = document.getElementById("campos-entrada");

let tabelaTentativas = document.getElementById("tabela-tentativas");

botaoReiniciar.onclick = () => {
    window.location.reload();
}

botaoAvaliar.onclick = () => {
    if(entradas.every((entrada) => entrada.value)){
        let str = entradas.reduce((acumulador, entrada) => acumulador + entrada.value, "");
        let palavraOculta = palavraAleatoria.normalize('NFD').replace(/[^a-zA-Z\s]/g, "");
        if(str.toLowerCase() == palavraOculta){
            alert("Parabéns, você acertou!");
            window.location.reload();
        }
        else{
            let linha = document.createElement('tr');
            linha.setAttribute('class', 'linha-tabela');
            for(let i = 0; i < entradas.length; i++){
                let item = document.createElement('td');
                item.innerHTML = entradas[i].value;
                if(entradas[i].value == palavraOculta[i]){
                    item.setAttribute('class', 'item-tabela correto');
                }
                else{
                    item.setAttribute('class', 'item-tabela errado');
                }
                linha.appendChild(item);
            }
            tabelaTentativas.appendChild(linha);

            entradas = entradas.map((entrada) => {
                entrada.value = "";
                return entrada;
            });
        }
    }
    else{
        alert("Preencha todos os campos!");
    }
    entradas[0].focus();
}

async function carregarPalavraAleatoria(){
    do{
        palavraAleatoria = await buscarPalavraAleatoria();
    } while(palavraAleatoria.length > 7);
    return palavraAleatoria;
}

async function iniciarJogo(){
    await carregarPalavraAleatoria();

    for(let i = 0; i < palavraAleatoria.length; i++){
        let entrada = document.createElement('input');
        entrada.setAttribute('class', 'campo-entrada');
        entrada.setAttribute('type', 'text');
        entradas.push(entrada);
        camposEntrada.appendChild(entrada);
    }
    for(let i = 1; i < palavraAleatoria.length - 1; i++){
        entradas[i].addEventListener('input', () => {
            switch(entradas[i].textLength){
                case 0:
                    entradas[i-1].focus();
                    break;
                case 1:
                    entradas[i+1].focus();
                    break;
                default:
                    entradas[i].value = entradas[i].value[0];
            }
        });
    }
    entradas[0].addEventListener('input', () => {
        switch(entradas[0].textLength){
            case 0:
                break;
            case 1:
                entradas[1].focus();
                break;
            default:
                entradas[0].value = entradas[0].value[0];
        }
    });
    entradas[palavraAleatoria.length - 1].addEventListener('input', () => {
        switch(entradas[palavraAleatoria.length - 1].textLength){
            case 0:
                entradas[palavraAleatoria.length - 2].focus();
                break;
            case 1:
                botaoAvaliar.focus();
                break;
            default:
                entradas[palavraAleatoria.length - 1].value = entradas[palavraAleatoria.length - 1].value[0];
        }
    });
}

iniciarJogo();