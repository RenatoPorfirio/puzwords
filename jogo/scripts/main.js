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
    function AuxiliarContagem(contagem){
        this.contagem = contagem;
        this.pilha = [];
        return this;
    }
    let {entradas, tabelaTentativas, palavraAleatoria, tentativas, textoTentativas, xml} = metadados;
    var palavraOculta = palavraAleatoria.normalize('NFD').replace(/[^a-zA-Z\s]/g, "").toLowerCase();
    const caracteres = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
    var tabelaCaracteres = {};
    for(ch of caracteres){
        tabelaCaracteres[ch] = 0;
    }

    for(ch of palavraOculta){
        tabelaCaracteres[ch]++;
    }

    return () => {
        if(entradas.every((entrada) => entrada.value)){
            let stringEntrada = entradas.reduce((acumulador, entrada) => acumulador + entrada.value, "").toLowerCase();
            if(stringEntrada == palavraOculta){
                let principal = document.querySelector('.conteudo-principal');
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
                    let tabelaChecagem = {};
                    for(ch of caracteres){
                        tabelaChecagem[ch] = new AuxiliarContagem(tabelaCaracteres[ch]);
                    }
                    let linha = document.createElement('tr');
                    linha.setAttribute('class', 'linha-tabela');
                    for(let i = 0; i < stringEntrada.length; i++){
                        let caractere = stringEntrada[i];
                        let auxiliarContagem = tabelaChecagem[caractere];
                        let item = document.createElement('td');
                        item.innerHTML = stringEntrada[i];
                        if(caractere == palavraOculta[i]){
                            if(auxiliarContagem.contagem){
                                auxiliarContagem.contagem--;
                            }
                            else{
                                auxiliarContagem.pilha.pop().setAttribute('class', 'item-tabela letra-incorreta');
                            }
                            item.setAttribute('class', 'item-tabela posicao-correta');
                        }
                        else if(auxiliarContagem.contagem){
                            auxiliarContagem.contagem--;
                            auxiliarContagem.pilha.push(item);
                            item.setAttribute('class', 'item-tabela posicao-incorreta');
                        }
                        else{
                            item.setAttribute('class', 'item-tabela letra-incorreta');
                        }
                        linha.appendChild(item);
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