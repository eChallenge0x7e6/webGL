/**
 * webGLの基本コード
 * wgld.orgを参考にしている。
 * wgld.orgで配布されているminMatrix.jsを利用している。
 */
var canvas;
var gl;
var uniLocation;
var attLocation;
var attStride;
var count;

function create_shader(id){
  let shader;// シェーダを格納する変数
  let scriptElement = document.getElementById(id);// HTMLからscriptタグへの参照を取得
  
  // scriptタグが存在しない場合は抜ける
  if(!scriptElement){
    alert("Not found Tag of script");
    return;
  }//else skip
  
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
  let program = gl.createProgram();// プログラムオブジェクトの生成
  
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
  let vbo = gl.createBuffer();// 頂点バッファオブジェクトの生成
  
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
  var ibo = gl.createBuffer();// インデックスバッファオブジェクトの生成
        
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

function square_model(){

  var sq_vp = [
    0.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    0.0, 1.0, 0.0,
    1.0, 1.0, 0.0,
  ];

  var sq_vc = [
    1.0, 0.0, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
  ];

  var sq_idx = [
    0,1,2,
    2,1,3,
  ];

  set_attribute([sq_vp, sq_vc], attLocation, attStride);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, create_ibo(sq_idx));

  return sq_idx.length;
}

function cube_model(w, d, h, x, y, z, r, g, b, a){
  
  let cube_vp = [
    x   ,y  ,z,
    w+x ,y  ,z,
    w+x ,d+y,z,
    x   ,d+y,z,
    x   ,d+y,h+z,
    x   ,y  ,h+z,
    w+x ,y  ,h+z,
    w+x ,d+y,h+z,
  ];

  let cube_vc = [
    1.0, g, b, a,
    r, g, b, a,
    r, g, b, a,
    r, g, b, a,
    r, g, b, a,
    r, g, b, a,
    r, g, b, a,
    1.0, g, b, a,
  ];

  let cube_idx = [
    0,3,2, 2,1,0,
    0,1,6, 6,5,0,
    0,5,4, 4,3,0,
    7,4,5, 5,6,7,
    7,6,1, 1,2,7,
    7,2,3, 3,4,7,
  ];

  //set_attribute([cube_vp, cube_vc], attLocation, attStride);
  //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, create_ibo(cube_idx));

  return [cube_vp, cube_vc, cube_idx];
}

class Model {

  constructor(gl, ver, idx){
    this.ver = ver;
    this.vbo = this.create_vbo(gl, ver);
    if(idx!=undefined){
      this.idx = idx;
      this.ibo = this.create_ibo(gl, idx);
    } else {
      this.idx = [];
      this.ibo = [];
    }
    this.matrix;
  }

  create_vbo(gl, ver){
    let vbo = new Array(ver.length);
    for(let i=0; i<ver.length; i++){
      vbo[i] = gl.createBuffer();// 頂点バッファオブジェクトの生成
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);// バッファをバインドする
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ver[i]), gl.STATIC_DRAW);// バッファにデータをセット
      gl.bindBuffer(gl.ARRAY_BUFFER, null);// バッファのバインドを無効化、バッファのバインドは1度に１つだけ
    }
    return vbo;
  }

  create_ibo(gl, idx){
    let ibo = gl.createBuffer();// インデックスバッファオブジェクトの生成
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);// バッファをバインドする
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(idx), gl.STATIC_DRAW);// バッファにデータをセット
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);// バッファのバインドを無効化
    return ibo;
  }

  set_attribute(gl, attLocation, attStride){
    for(let i=0; i<this.vbo.length; i++){
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo[i]);// VBOをバインド
      gl.enableVertexAttribArray(attLocation[i]);// attribute属性を有効にする
      gl.vertexAttribPointer(attLocation[i], attStride[i], gl.FLOAT, false, 0, 0);// attribute属性を登録
    }
    if(this.idx.length>0) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);// IBOをバインド
    //else skip
  }

  set_matrix(mvpMatrix){
    this.matrix = mvpMatrix;
  }
  
  draw(gl, uniLocation){
    // uniformLocationへ座標変換行列を登録と描画
    gl.uniformMatrix4fv(uniLocation, false, this.matrix);
    if(this.idx.length>0) gl.drawElements(gl.TRIANGLES, this.idx.length, gl.UNSIGNED_SHORT, 0);// インデックスを用いた描画命令
    else                  gl.drawArrays(gl.TRIANGLES, 0, this.ver[0].length/3);
  }
}

class MinMatrixModel extends Model {
  constructor(gl, ver, idx){
    super(gl, ver, idx);  //モデルクラス生成
    
    this.m = new matIV();                             // matIVオブジェクトを生成
    this.mMatrix = this.m.identity(this.m.create());  // モデル変換行列
    this.vMatrix = this.m.identity(this.m.create());  // ビュー変換行列
    this.pMatrix = this.m.identity(this.m.create());  // プロジェクション変換行列
    this.vpMatrix = this.m.identity(this.m.create()); // 中間変換行列
  }

  set_projection(){
    this.m.perspective(90, canvas.width / canvas.height, 0.1, 100, this.pMatrix);
    this.m.multiply(this.pMatrix, this.vMatrix, this.vpMatrix); // p に v を掛ける
  }

  set_view(){
    this.m.lookAt([0.0, 1.0, 3.0], [0, 0, 0], [0, 1, 0], this.vMatrix);
    this.m.multiply(this.pMatrix, this.vMatrix, this.vpMatrix); // p に v を掛ける
  }

  set_model(mMrx){
    let mvpMatrix = this.m.identity(this.m.create());
    this.m.multiply(this.vpMatrix, mMrx, mvpMatrix); // さらに m を掛ける
    this.set_matrix(mvpMatrix);
  }
}

class Triangle extends MinMatrixModel {
  constructor(gl, size, color){
    let x = size[0];
    let y = size[1];
    let vp = [
      0.0, 0.0, 0.0,
      x  , 0.0, 0.0,
      0.0, y  , 0.0,
    ];
  
    let r = color[0];
    let g = color[1];
    let b = color[2];
    let a = color[3];
    let vc = [
      r, g, b, a,
      r, g, b, a,
      r, g, b, a,
    ];

    super(gl, [vp, vc], );
  }
}

class Cube extends MinMatrixModel {
  constructor(gl, size, position, color){
    let w = size[0];
    let h = size[1];
    let d = size[2];
    let x = position[0];
    let y = position[0];
    let z = position[0];
    let vp = [
      x   ,y  ,z,
      w+x ,y  ,z,
      w+x ,d+y,z,
      x   ,d+y,z,
      x   ,d+y,h+z,
      x   ,y  ,h+z,
      w+x ,y  ,h+z,
      w+x ,d+y,h+z,
    ];

    let r = color[0];
    let g = color[1];
    let b = color[2];
    let a = color[3];
    let vc = [
      r, g, b, a,
      r, g, b, a,
      r, g, b, a,
      r, g, b, a,
      r, g, b, a,
      r, g, b, a,
      r, g, b, a,
      r, g, b, a,
    ];

    let idx = [
      0,3,2, 2,1,0,
      0,1,6, 6,5,0,
      0,5,4, 4,3,0,
      7,4,5, 5,6,7,
      7,6,1, 1,2,7,
      7,2,3, 3,4,7,
    ];

    super(gl, [vp, vc], idx);  //モデルクラス生成
  }
}

onload = function(){
  canvas = document.getElementById("canvas");// canvasエレメントを取得
  canvas.width = 500;
  canvas.height = 500;
  gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');// webglコンテキストを取得
  
  // 頂点シェーダとフラグメントシェーダの生成
  let v_shader = create_shader('vs');
  let f_shader = create_shader('fs');
  // プログラムオブジェクトの生成とリンク
  let prg = create_program(v_shader, f_shader);

  attLocation = new Array(2);
  attLocation[0] = gl.getAttribLocation(prg, 'position');// attributeLocationの取得
  attLocation[1] = gl.getAttribLocation(prg, 'color');// attributeLocationの取得
  attStride = new Array(2);
  attStride[0] = 3;// attributeの要素数(この場合は xyz の3要素)
  attStride[1] = 4;// attributeの要素数(この場合は rgba の4要素)
  uniLocation = gl.getUniformLocation(prg, 'mvpMatrix');

  let m = new matIV();
  //let data = cube_model(1.0, 1.0, 0.5, -1.0, -1.0, 1.0, 0.3, 0.7, 0.0, 1.0);

  let cube = new Cube(gl, [1.0, 1.0, 0.5], [-1.0, -1.0, 1.0], [0.3, 0.7, 0.0, 1.0]);
  if(true){
    cube.set_projection();
    cube.set_view();
  }
  
  let tri = new Triangle(gl, [1.0, 1.0], [0.0, 0.0, 1.0, 1.0]);
  if(true){
    tri.set_projection();
    tri.set_view();
  }

  //ループ
  count=0;
  gl.enable(gl.CULL_FACE);//カリング（表裏判断）有効
  gl.frontFace(gl.CCW);//反時計回りを表 (CW:時計回りを表)
  gl.enable(gl.DEPTH_TEST);//深度テスト有効
  gl.depthFunc(gl.LEQUAL);//テスト方法

  (function(){
    count++;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);// canvasを初期化する色を設定する
    gl.clearDepth(1.0);// canvasを初期化する際の深度を設定する
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);// canvasを初期化
    
    // モデル1は円の軌道を描き移動する
    let rad = (count % 360) * Math.PI / 180;
    let x = Math.cos(rad);
    let y = Math.sin(rad);
    let mMatrix = m.identity(m.create());
    
    if(true){
      tri.set_attribute(gl, attLocation, attStride);
      //m.translate(mMatrix, [0.0, 0.0, 0.0], mMatrix);
      tri.set_model(mMatrix);
      tri.draw(gl, uniLocation);
    }
    
    if(true){
      cube.set_attribute(gl, attLocation, attStride);
      mMatrix = m.identity(m.create());
      m.translate(mMatrix, [x, y , 0.0], mMatrix);
      cube.set_model(mMatrix);
      cube.draw(gl, uniLocation);
    }

    gl.flush();// コンテキストの再描画
    setTimeout(arguments.callee, 1000 / 30);//30fps
  })();
}

window.addEventListener("DOMContentLoaded", () => {});