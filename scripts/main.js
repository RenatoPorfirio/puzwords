async function buscarPalavraAleatoria(){
    const resposta = await fetch('https://api.dicionario-aberto.net/random')
        .then(resposta => resposta.json())
        .then(dados => dados.word)
        .catch(erro => {console.log(erro); return "ERRO!!";});
    return resposta;
}

var cola;
var entradas = [];

let botaoReiniciar = document.querySelector(".botao-circulo-header");

let botaoAvaliar = document.getElementById("botao-avaliar");

let camposEntrada = document.getElementById("campos-entrada");

let tabelaTentativas = document.getElementById("tabela-tentativas");

botaoReiniciar.onclick = () => {
    window.location.reload();
}

async function carregarPalavraAleatoria(){
    let palavraAleatoria;
    do{
        palavraAleatoria = await buscarPalavraAleatoria();
    } while(palavraAleatoria.length > 7);
    return palavraAleatoria;
}

async function iniciarJogo(){
    let palavraAleatoria = await carregarPalavraAleatoria();

    cola = palavraAleatoria;

    botaoAvaliar.onclick = () => {
        if(entradas.every((entrada) => entrada.value)){
            let str = entradas.reduce((acumulador, entrada) => acumulador + entrada.value, "");
            let palavraOculta = palavraAleatoria.normalize('NFD').replace(/[^a-zA-Z\s]/g, "");
            //let existencia = await fetch('https://api.dicionario-aberto.net/word'+palavraOculta);
            // if(existencia.length === 0){
            //     alert('Digite uma palavra válida!!');
            // }
            //else
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

    const [letras, tentativas] = document.getElementsByClassName('titulo-conteudo-principal');
    letras.innerText += palavraAleatoria.length + ' LETRAS';
    tentativas.innerText += ' ' + 10;

    for(let i = 0; i < palavraAleatoria.length; i++){
        let entrada = document.createElement('input');
        entrada.setAttribute('class', 'campo-entrada');
        entrada.setAttribute('type', 'text');
        entradas.push(entrada);
        camposEntrada.appendChild(entrada);
    }
    for(let i = 0; i < palavraAleatoria.length; i++){
        entradas[i].addEventListener('input', (e) => {
            if(e.inputType === 'deleteContentBackward' && i != 0){
                entradas[i-1].focus();
            }
            else if(e.inputType === 'insertText'){
                if(entradas[i].value.length > 1){
                    entradas[i].value = entradas[i].value[0];
                }
                else if(i == palavraAleatoria.length - 1){
                    botaoAvaliar.focus();
                }
                else{
                    entradas[i+1].focus();
                }
            }
        });
    }
}

iniciarJogo();