/**
 * 
 */
var canvas;
var gl;
var uniLocation;
var attLocation = new Array(2);
var attStride = new Array(2);
var count;

function create_shader(id){
  var shader;// シェーダを格納する変数
  var scriptElement = document.getElementById(id);// HTMLからscriptタグへの参照を取得
  
  // scriptタグが存在しない場合は抜ける
  if(!scriptElement){return;}
  
  // scriptタグのtype属性をチェック
  switch(scriptElement.type){
    case 'x-shader/x-vertex':// 頂点シェーダの場合
      shader = gl.createShader(gl.VERTEX_SHADER);
      break;
    case 'x-shader/x-fragment':// フラグメントシェーダの場合
      shader = gl.createShader(gl.FRAGMENT_SHADER);
      break;
    default :
      return;
  }
  
  // 生成されたシェーダにソースを割り当てる
  gl.shaderSource(shader, scriptElement.text);
  
  // シェーダをコンパイルする
  gl.compileShader(shader);
  
  // シェーダが正しくコンパイルされたかチェック
  if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){// 成功していたらシェーダを返して終了
    return shader;
  } else{// 失敗していたらエラーログをアラートする
    alert(gl.getShaderInfoLog(shader));
  }
}

function create_program(vs, fs){
  var program = gl.createProgram();// プログラムオブジェクトの生成
  
  // プログラムオブジェクトにシェーダを割り当てる
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  
  // シェーダをリンク
  gl.linkProgram(program);
  
  // シェーダのリンクが正しく行なわれたかチェック
  if(gl.getProgramParameter(program, gl.LINK_STATUS)){
    gl.useProgram(program);// 成功していたらプログラムオブジェクトを有効にする
    return program;// プログラムオブジェクトを返して終了
  } else {
    alert(gl.getProgramInfoLog(program));// 失敗していたらエラーログをアラートする
  }
}

function create_vbo(data){
  var vbo = gl.createBuffer();// バッファオブジェクトの生成
  
  // バッファをバインドする
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  
  // バッファにデータをセット
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  
  // バッファのバインドを無効化、バッファのバインドは1度に１つだけ
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
  // 生成した VBO を返して終了
  return vbo;
}

function create_ibo(data){
  var ibo = gl.createBuffer();// バッファオブジェクトの生成
        
  // バッファをバインドする
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  
  // バッファにデータをセット
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
  
  // バッファのバインドを無効化
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  
  // 生成したIBOを返して終了
  return ibo;
}

function create_Matrix(){
  let m = new matIV();// matIVオブジェクトを生成
  let mMatrix = m.identity(m.create());   // モデル変換行列
  let vMatrix = m.identity(m.create());   // ビュー変換行列
  let pMatrix = m.identity(m.create());   // プロジェクション変換行列
  let mvpMatrix = m.identity(m.create()); // 最終座標変換行列

  // ビュー座標変換行列
  m.lookAt([0.0, 1.0, 3.0], [0, 0, 0], [0, 1, 0], vMatrix);
    
  // プロジェクション座標変換行列
  m.perspective(90, canvas.width / canvas.height, 0.1, 100, pMatrix);

  // 各行列を掛け合わせる順序を示す(p->v->m)
  m.multiply(pMatrix, vMatrix, mvpMatrix); // p に v を掛ける
  m.multiply(mvpMatrix, mMatrix, mvpMatrix); // さらに m を掛ける
  return mvpMatrix;
}

function set_attribute(vertex, attLocation, attStride){
  for(let i=0; i<vertex.length; i++){
    let vbo = create_vbo(vertex[i]);// VBOの生成
    
    // VBOをバインド
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    
    // attribute属性を有効にする
    gl.enableVertexAttribArray(attLocation[i]);
    
    // attribute属性を登録
    gl.vertexAttribPointer(attLocation[i], attStride[i], gl.FLOAT, false, 0, 0);
  }
}

function tri_draw(){
  // minMatrix.js を用いた行列関連処理
  let mvpMatrix = create_Matrix();

  matIV.translate(mvpMatrix, [x, y + 1.0, 0.0], mvpMatrix);

  // uniformLocationへ座標変換行列を登録と描画
  gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  
  return Matrix;
}
/*
  class plane_model {
    constructor(){

    }
  }
*/
onload = function(){
  canvas = document.getElementById("canvas");// canvasエレメントを取得
  canvas.width = 500;
  canvas.height = 500;
  gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');// webglコンテキストを取得
  gl.clearColor(0.0, 0.0, 0.0, 1.0);// canvasを初期化する色を設定する
  gl.clearDepth(1.0);// canvasを初期化する際の深度を設定する
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);// canvasを初期化
  // 頂点シェーダとフラグメントシェーダの生成
  var v_shader = create_shader('vs');
  var f_shader = create_shader('fs');
  
  // プログラムオブジェクトの生成とリンク
  var prg = create_program(v_shader, f_shader);

  //attLocation = new Array(2);
  attLocation[0] = gl.getAttribLocation(prg, 'position');// attributeLocationの取得
  attLocation[1] = gl.getAttribLocation(prg, 'color');// attributeLocationの取得
  //attStride = new Array(2);
  attStride[0] = 3;// attributeの要素数(この場合は xyz の3要素)
  attStride[1] = 4;// attributeの要素数(この場合は rgba の4要素)
  uniLocation = gl.getUniformLocation(prg, 'mvpMatrix');
  
  // モデル(頂点)データ1
  var vertex_position = [
      0.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      1.0, 1.0, 0.0,
  ];
  
  var vertex_color = [
    1.0, 0.0, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
  ];

  var cube_vp = [
    0.0,0.0,0.0,
    1.0,0.0,0.0,
    1.0,1.0,0.0,
    0.0,1.0,0.0,
    0.0,1.0,1.0,
    0.0,0.0,1.0,
    1.0,0.0,1.0,
    1.0,1.0,1.0,
  ];
  var cube_vc = [
    1.0, 0.0, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,
  ];

  set_attribute([cube_vp, cube_vc], attLocation, attStride);

  var index = [
    0,1,2,
    2,1,3,];
  var cube_idx = [
    0,3,2, 2,1,0,
    0,1,6, 6,5,0,
    0,5,4, 4,3,0,
    7,4,5, 5,6,7,
    7,6,1, 1,2,7,
    7,2,3, 3,4,7,
  ];
  var ibo = create_ibo(cube_idx);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

  let m = new matIV();
  let vpMatrix = create_Matrix();
  //ループ
  count=0;
  gl.enable(gl.CULL_FACE);//カリング（表裏判断）有効
  gl.frontFace(gl.CCW);//反時計回りを表
  //gl.frontFace(gl.CW);//時計回りを表
  gl.enable(gl.DEPTH_TEST);//深度テスト有効
  gl.depthFunc(gl.LEQUAL);//テスト方法
  (function(){
    count++;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);// canvasを初期化する色を設定する
    gl.clearDepth(1.0);// canvasを初期化する際の深度を設定する
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);// canvasを初期化
    
    var rad = (count % 360) * Math.PI / 180;
    // モデル1は円の軌道を描き移動する
    var x = Math.cos(rad);
    var y = Math.sin(rad);
    let mvpMatrix = m.identity(m.create());
    m.translate(vpMatrix, [x, y , 0.0], mvpMatrix);

    // uniformLocationへ座標変換行列を登録と描画
    gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
    gl.drawElements(gl.TRIANGLES, cube_idx.length, gl.UNSIGNED_SHORT, 0);// インデックスを用いた描画命令
    //gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);// インデックスを用いた描画命令
    //gl.drawArrays(gl.TRIANGLES, 0, 3);

    //モデル2
    mvpMatrix = m.identity(m.create());
    m.translate(vpMatrix, [0.0, x, y], mvpMatrix);
    m.rotate(mvpMatrix, rad*2, [1,0,0], mvpMatrix);

    // uniformLocationへ座標変換行列を登録と描画
    gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
    gl.drawElements(gl.TRIANGLES, cube_idx.length, gl.UNSIGNED_SHORT, 0);// インデックスを用いた描画命令
    //gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);// インデックスを用いた描画命令

    gl.flush();// コンテキストの再描画
    setTimeout(arguments.callee, 1000 / 30);//30fps
  })();
}

window.addEventListener("DOMContentLoaded", () => {});