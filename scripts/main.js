//Variáveis globais
let cola = "";
//
async function buscarPalavraAleatoria(){
    const resposta = await fetch('https://api.dicionario-aberto.net/random')
        .then(resposta => resposta.json())
        .then(dados => dados.word)
        .catch(erro => {console.log(erro); return "ERRO!!";});
    return resposta;
}

async function carregarPalavraAleatoria(){
    let palavraAleatoria;
    do{
        palavraAleatoria = await buscarPalavraAleatoria();
    } while(palavraAleatoria.length > 7);
    let xml = await fetch('https://api.dicionario-aberto.net/word/'+palavraAleatoria).then(response => response.json()).then(data => data[0].xml);
    return {palavraAleatoria, xml};
}

function avaliar(metadados){
    let {entradas, tabelaTentativas, palavraAleatoria, tentativas, textoTentativas, xml} = metadados;
    var palavraOculta = palavraAleatoria.normalize('NFD').replace(/[^a-zA-Z\s]/g, "").toLowerCase();
    var tabelaCaracteres = {
        a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, h: 0, i: 0, j: 0, k: 0, l: 0, m: 0,
        n: 0, o: 0, p: 0, q: 0, r: 0, s: 0, t: 0, u: 0, v: 0, w: 0, x: 0, y: 0, z: 0,
    };

    for(ch of palavraOculta){
        tabelaCaracteres[ch]++;
    }

    return () => {
        if(entradas.every((entrada) => entrada.value)){
            let stringEntrada = entradas.reduce((acumulador, entrada) => acumulador + entrada.value, "").toLowerCase();
            if(stringEntrada == palavraOculta){
                let principal = document.querySelector('.conteudo-principal');
                principal.setAttribute('class', 'texto-finalizacao');
                principal.innerHTML = `
                    <section class="texto-finalizacao">
                        <h1>Você VENCEU!!</h1>
                        <h2>A palavra oculta era:</h2>
                        <h3 class="titulo-texto-finalizacao">${palavraAleatoria}</h3>
                    </section>
                    <section class="texto-finalizacao">
                        <h3 style="margin-bottom:20px;font-size:50px;">SIGNIFICADO</h3>
                        <div style="color:#A67E62;font-size:20px;background-color:white;padding:10px;border-radius:20px">${xml}</div>   
                    </section>
                `;
            }
            else{
                tentativas--;
                if(!tentativas){
                    let principal = document.querySelector('.conteudo-principal');
                    principal.innerHTML = `
                        <section class="texto-finalizacao">
                            <h1>Você perdeu :(</h1>
                            <h2>A palavra oculta era:</h2>
                            <h3 class="titulo-texto-finalizacao">${palavraAleatoria}</h3>
                        </section>
                        <section class="texto-finalizacao">
                            <h3 style="margin-bottom:20px;font-size:50px;">SIGNIFICADO</h3>
                            <div style="color:#A67E62;font-size:20px;background-color:white;padding:10px;border-radius:20px">${xml}</div>   
                        </section>
                    `;
                }
                else{
                    let tabelaChecagem = {...tabelaCaracteres};
                    let linha = document.createElement('tr');
                    linha.setAttribute('class', 'linha-tabela');
                    for(let i = 0; i < stringEntrada.length; i++){
                        let caractere = stringEntrada[i];
                        let item = document.createElement('td');
                        item.innerHTML = stringEntrada[i];
                        if(caractere == palavraOculta[i]){
                            tabelaChecagem[caractere]--;
                            item.setAttribute('class', 'item-tabela posicao-correta');
                        }
                        else if(!tabelaChecagem[caractere]){
                            item.setAttribute('class', 'item-tabela letra-incorreta');
                        }
                        linha.appendChild(item);
                    }
                    for(let i = 0; i < linha.children.length; i++){
                        let item = linha.children[i];
                        if(!item.classList.length){
                            if(tabelaChecagem[item.innerText]){
                                tabelaChecagem[item.innerText]--;
                                item.setAttribute('class', 'item-tabela posicao-incorreta');
                            }
                            else{
                                item.setAttribute('class', 'item-tabela letra-incorreta');
                            }
                        }
                    }
                    tabelaTentativas.appendChild(linha);
        
                    entradas = entradas.map((entrada) => {
                        entrada.value = "";
                        return entrada;
                    });
                    metadados.tentativas = tentativas;
                    textoTentativas.innerText = 'TENTATIVAS RESTANTES: ' + tentativas;
                }
            }
        }
        else{
            alert("Preencha todos os campos!");
        }
        entradas[0].focus();
    }
}

async function iniciarJogo(){
    let {palavraAleatoria, xml} = await carregarPalavraAleatoria();
    let entradas = [];
    let botaoReiniciar = document.querySelector(".botao-circulo-header");
    let botaoAvaliar = document.getElementById("botao-avaliar");
    let camposEntrada = document.getElementById("campos-entrada");
    let tabelaTentativas = document.getElementById("tabela-tentativas");
    const [textoLetras, textoTentativas] = document.getElementsByClassName('titulo-conteudo-principal');
    let metadados = {
        entradas: entradas,
        tabelaTentativas: tabelaTentativas,
        palavraAleatoria: palavraAleatoria,
        tentativas: 10,
        textoTentativas: textoTentativas,
        xml: xml,
    };

    textoLetras.innerText += palavraAleatoria.length + ' LETRAS';
    textoTentativas.innerText += ' ' + 10;

    cola = palavraAleatoria;

    botaoReiniciar.onclick = () => {
        window.location.reload();
    }

    botaoAvaliar.addEventListener('keyup', (e) => {
        if(e.key === 'Backspace' || e.key === 'ArrowLeft'){
            entradas[palavraAleatoria.length-1].focus();
        }
    });

    botaoAvaliar.onclick = avaliar(metadados);

    for(let i = 0; i < palavraAleatoria.length; i++){
        let entrada = document.createElement('input');
        entrada.setAttribute('class', 'campo-entrada');
        entrada.setAttribute('type', 'text');
        entradas.push(entrada);
        camposEntrada.appendChild(entrada);
    }
    for(let i = 0; i < palavraAleatoria.length; i++){
        entradas[i].addEventListener('input', (e) => {
            if(e.inputType === 'insertText'){
                let ch = e.data.toLowerCase();
                if(entradas[i].value.length > 1 && (('a' <= ch && ch <= 'z') || ch === '-')){
                    entradas[i].value = ch;
                    try{
                        entradas[i+1].focus();
                    }
                    catch {
                        botaoAvaliar.focus();
                    }
                }
                else if((ch < 'a' || 'z' < ch) && ch != '-'){
                    entradas[i].value = "";
                }
                else if(i == palavraAleatoria.length - 1){
                    botaoAvaliar.focus();
                }
                else{
                    entradas[i+1].focus();
                }
            }
        });
        entradas[i].addEventListener('keyup', (e) => {
            if((e.key === 'Backspace' || e.key === 'ArrowLeft') && i != 0){
                entradas[i-1].focus();
            }
            else if(e.key === 'ArrowRight'){
                try{
                    entradas[i+1].focus();
                }
                catch{
                    botaoAvaliar.focus();
                }
            }
        });
    }
}

iniciarJogo();