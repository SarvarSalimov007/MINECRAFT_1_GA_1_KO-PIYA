import * as THREE from 'three';

// ==================== O'YIN KONFIGURATSIYASI ====================
const WORLD_SIZE = 50;
const BLOCK_SIZE = 1;
const MOUSE_SENSITIVITY = 0.003; // Yaxshiroq qarash uchun

// Blok ranglari
const BLOCK_COLORS = {
    grass: {
        top: 0x7cba3d,
        sides: 0x8b6914,
        bottom: 0x8b6914
    },
    dirt: 0x8b6914,
    stone: 0x7a7a7a,
    wood: 0x8b6914,
    sand: 0xdbd3a0,
    glass: 0xa0d2f0,
    cobblestone: 0x6a6a6a,
    leaves: 0x3a7a3a,
    coal: 0x1a1a1a
};

// ==================== MOB KLASSLARI ====================
class Mob {
    constructor(type, x, y, z) {
        this.type = type;
        this.position = new THREE.Vector3(x, y, z);
        this.velocity = new THREE.Vector3();
        this.model = null;
        this.animationTime = 0;
        this.wanderDirection = new THREE.Vector3();
        this.wanderTime = 0;
        this.onGround = false;
        
        this.createModel();
    }

    createModel() {
        this.model = new THREE.Group();
        
        if (this.type === 'sheep') {
            // Qo'y modeli
            const bodyGeometry = new THREE.BoxGeometry(0.8, 0.6, 1.0);
            const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.set(0, 0.3, 0);
            this.model.add(body);
            
            // Bosh
            const headGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
            const head = new THREE.Mesh(headGeometry, bodyMaterial);
            head.position.set(0, 0.5, -0.5);
            this.model.add(head);
            
            // Oyoqlar
            const legGeometry = new THREE.BoxGeometry(0.2, 0.4, 0.2);
            const legPositions = [
                [-0.3, 0.2, -0.4],
                [0.3, 0.2, -0.4],
                [-0.3, 0.2, 0.4],
                [0.3, 0.2, 0.4]
            ];
            legPositions.forEach(pos => {
                const leg = new THREE.Mesh(legGeometry, bodyMaterial);
                leg.position.set(...pos);
                this.model.add(leg);
            });
            
        } else if (this.type === 'pig') {
            // Cho'chqa modeli
            const bodyGeometry = new THREE.BoxGeometry(0.9, 0.7, 0.9);
            const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xffb6c1 });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.set(0, 0.35, 0);
            this.model.add(body);
            
            // Bosh
            const headGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.5);
            const head = new THREE.Mesh(headGeometry, bodyMaterial);
            head.position.set(0, 0.55, -0.5);
            this.model.add(head);
            
            // Burun
            const noseGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.2);
            const nose = new THREE.Mesh(noseGeometry, bodyMaterial);
            nose.position.set(0, 0.5, -0.7);
            this.model.add(nose);
            
            // Oyoqlar
            const legGeometry = new THREE.BoxGeometry(0.25, 0.4, 0.25);
            const legPositions = [
                [-0.3, 0.2, -0.3],
                [0.3, 0.2, -0.3],
                [-0.3, 0.2, 0.3],
                [0.3, 0.2, 0.3]
            ];
            legPositions.forEach(pos => {
                const leg = new THREE.Mesh(legGeometry, bodyMaterial);
                leg.position.set(...pos);
                this.model.add(leg);
            });
            
        } else if (this.type === 'chicken') {
            // Tovuq modeli
            const bodyGeometry = new THREE.BoxGeometry(0.5, 0.6, 0.5);
            const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.set(0, 0.3, 0);
            this.model.add(body);
            
            // Bosh
            const headGeometry = new THREE.BoxGeometry(0.3, 0.4, 0.3);
            const head = new THREE.Mesh(headGeometry, bodyMaterial);
            head.position.set(0, 0.6, -0.2);
            this.model.add(head);
            
            // Tovuq tumshug'i
            const beakGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.15);
            const beakMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700 });
            const beak = new THREE.Mesh(beakGeometry, beakMaterial);
            beak.position.set(0, 0.55, -0.3);
            this.model.add(beak);
            
            // Oyoqlar
            const legGeometry = new THREE.BoxGeometry(0.15, 0.3, 0.15);
            const legMaterial = new THREE.MeshStandardMaterial({ color: 0xffa500 });
            const legPositions = [
                [-0.15, 0.15, -0.15],
                [0.15, 0.15, -0.15],
                [-0.15, 0.15, 0.15],
                [0.15, 0.15, 0.15]
            ];
            legPositions.forEach(pos => {
                const leg = new THREE.Mesh(legGeometry, legMaterial);
                leg.position.set(...pos);
                this.model.add(leg);
            });
        }
        
        this.model.position.copy(this.position);
        this.model.castShadow = true;
    }

    update(deltaTime, gameInstance) {
        this.animationTime += deltaTime;
        this.wanderTime += deltaTime;
        
        // Yer balandligini topish
        const groundY = gameInstance.getGroundHeight(this.position.x, this.position.z);
        this.position.y = groundY + 0.5;
        this.onGround = true;
        
        // Tasodifiy yurish
        if (this.wanderTime > 3 || this.wanderDirection.length() < 0.1) {
            this.wanderDirection.set(
                (Math.random() - 0.5) * 2,
                0,
                (Math.random() - 0.5) * 2
            ).normalize();
            this.wanderTime = 0;
        }
        
        // Harakat tezligi
        const speed = this.type === 'chicken' ? 3 : 2;
        this.velocity.x = this.wanderDirection.x * speed;
        this.velocity.z = this.wanderDirection.z * speed;
        
        // Animatsiya (tep-tebranish)
        const bounce = Math.sin(this.animationTime * 8) * 0.02;
        this.position.y += bounce;
        
        // Pozitsiyani yangilash
        this.position.x += this.velocity.x * deltaTime;
        this.position.z += this.velocity.z * deltaTime;
        
        // Model pozitsiyasini yangilash
        this.model.position.copy(this.position);
        
        // Model yo'nalishini yangilash
        if (this.velocity.length() > 0.1) {
            this.model.lookAt(
                this.position.x + this.wanderDirection.x,
                this.position.y,
                this.position.z + this.wanderDirection.z
            );
        }
        
        // Oyoq harakati animatsiyasi
        const legSpeed = this.type === 'chicken' ? 20 : 10;
        this.model.children.forEach((child, index) => {
            if (child.geometry && child.position.y < 0.3) {
                // Oyoqlar animatsiyasi
                child.rotation.x = Math.sin(this.animationTime * legSpeed) * 0.3;
            }
        });
    }
}

// ==================== O'YIN KLASSLARI ====================
class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.blocks = new Map();
        this.selectedBlock = 'grass';
        this.mouseLocked = false;
        this.keys = {};
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.canMove = true;
        
        // Animatsiya uchun
        this.animationTime = 0;
        this.isWalking = false;
        this.isJumping = false;
        this.handGroup = null;
        this.heldBlock = null;
        this.breakingBlock = null;
        this.breakingProgress = 0;
        this.breakingTime = 0;
        
        // Moblar
        this.mobs = [];
        
        this.init();
        this.createSteve();
        this.generateWorld();
        this.spawnMobs();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        // Renderer sozlash
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87ceeb); // Osmon rang
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        // Yoritish
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // Kamera pozitsiyasi
        this.camera.position.set(0, 20, 0);
        
        // Fog (tuman) effekti
        this.scene.fog = new THREE.Fog(0x87ceeb, 0, 200);
    }

    createSteve() {
        // First person view uchun qo'l va blok ko'rinishi
        this.handGroup = new THREE.Group();
        
        // Qo'l (oddiy kub)
        const handGeometry = new THREE.BoxGeometry(0.15, 0.4, 0.15);
        const handMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffdbac // Teri rang
        });
        const hand = new THREE.Mesh(handGeometry, handMaterial);
        hand.position.set(0.3, -0.2, -0.5);
        hand.rotation.x = 0.3;
        this.handGroup.add(hand);
        
        // Qo'lning qismlari (Minecraft stilida)
        const lowerArm = new THREE.Mesh(handGeometry, handMaterial);
        lowerArm.position.set(0.3, -0.4, -0.5);
        lowerArm.rotation.x = 0.3;
        this.handGroup.add(lowerArm);
        
        // Qo'lda ushlab turgan blok
        this.updateHeldBlock();
        
        this.handGroup.position.set(0, 0, 0);
        this.camera.add(this.handGroup);
    }

    updateHeldBlock() {
        // Eski blokni olib tashlash
        if (this.heldBlock) {
            this.handGroup.remove(this.heldBlock);
            this.heldBlock.geometry.dispose();
            if (Array.isArray(this.heldBlock.material)) {
                this.heldBlock.material.forEach(m => m.dispose());
            } else {
                this.heldBlock.material.dispose();
            }
        }

        // Yangi blok yaratish
        const blockSize = 0.25;
        let geometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
        let material;

        if (this.selectedBlock === 'glass') {
            material = new THREE.MeshStandardMaterial({
                color: BLOCK_COLORS[this.selectedBlock],
                transparent: true,
                opacity: 0.6,
                roughness: 0.1,
                metalness: 0.1
            });
        } else if (this.selectedBlock === 'grass') {
            const materials = [
                new THREE.MeshStandardMaterial({ color: BLOCK_COLORS.grass.sides }),
                new THREE.MeshStandardMaterial({ color: BLOCK_COLORS.grass.sides }),
                new THREE.MeshStandardMaterial({ color: BLOCK_COLORS.grass.top }),
                new THREE.MeshStandardMaterial({ color: BLOCK_COLORS.grass.bottom }),
                new THREE.MeshStandardMaterial({ color: BLOCK_COLORS.grass.sides }),
                new THREE.MeshStandardMaterial({ color: BLOCK_COLORS.grass.sides })
            ];
            this.heldBlock = new THREE.Mesh(geometry, materials);
            this.heldBlock.position.set(0.3, -0.3, -0.6);
            this.heldBlock.rotation.y = 0.5;
            this.heldBlock.rotation.x = 0.3;
            this.handGroup.add(this.heldBlock);
            return;
        } else {
            material = new THREE.MeshStandardMaterial({ 
                color: BLOCK_COLORS[this.selectedBlock] 
            });
        }

        this.heldBlock = new THREE.Mesh(geometry, material);
        this.heldBlock.position.set(0.3, -0.3, -0.6);
        this.heldBlock.rotation.y = 0.5;
        this.heldBlock.rotation.x = 0.3;
        this.handGroup.add(this.heldBlock);
    }

    generateWorld() {
        // Oddiy relief yaratish
        for (let x = -WORLD_SIZE; x < WORLD_SIZE; x++) {
            for (let z = -WORLD_SIZE; z < WORLD_SIZE; z++) {
                // Y balandligi - oddiy noise o'rniga oddiy formula
                const height = Math.floor(10 + Math.sin(x * 0.1) * Math.cos(z * 0.1) * 5);
                
                for (let y = 0; y <= height; y++) {
                    let blockType;
                    if (y === height) {
                        blockType = 'grass';
                    } else if (y >= height - 3) {
                        blockType = 'dirt';
                    } else {
                        blockType = 'stone';
                    }
                    this.createBlock(x, y, z, blockType);
                }
                
                // Ba'zi joylarda daraxtlar
                if (Math.random() > 0.98 && height > 8) {
                    this.createTree(x, height + 1, z);
                }
            }
        }
    }

    spawnMobs() {
        // Qo'ylar
        for (let i = 0; i < 15; i++) {
            const x = (Math.random() - 0.5) * WORLD_SIZE * 2;
            const z = (Math.random() - 0.5) * WORLD_SIZE * 2;
            const y = this.getGroundHeight(x, z) + 0.5;
            const sheep = new Mob('sheep', x, y, z);
            this.scene.add(sheep.model);
            this.mobs.push(sheep);
        }
        
        // Cho'chqalar
        for (let i = 0; i < 10; i++) {
            const x = (Math.random() - 0.5) * WORLD_SIZE * 2;
            const z = (Math.random() - 0.5) * WORLD_SIZE * 2;
            const y = this.getGroundHeight(x, z) + 0.5;
            const pig = new Mob('pig', x, y, z);
            this.scene.add(pig.model);
            this.mobs.push(pig);
        }
        
        // Tovuqlar
        for (let i = 0; i < 20; i++) {
            const x = (Math.random() - 0.5) * WORLD_SIZE * 2;
            const z = (Math.random() - 0.5) * WORLD_SIZE * 2;
            const y = this.getGroundHeight(x, z) + 0.5;
            const chicken = new Mob('chicken', x, y, z);
            this.scene.add(chicken.model);
            this.mobs.push(chicken);
        }
    }

    createTree(x, y, z) {
        // Daraxt tanasi (3-5 blok)
        const trunkHeight = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < trunkHeight; i++) {
            this.createBlock(x, y + i, z, 'wood');
        }
        
        // Daraxt shoxlari
        const leavesY = y + trunkHeight;
        for (let dx = -2; dx <= 2; dx++) {
            for (let dz = -2; dz <= 2; dz++) {
                for (let dy = 0; dy <= 2; dy++) {
                    if (Math.abs(dx) + Math.abs(dz) + dy < 4) {
                        const leavesX = x + dx;
                        const leavesZ = z + dz;
                        const blockKey = `${leavesX},${leavesY + dy},${leavesZ}`;
                        if (!this.blocks.has(blockKey)) {
                            this.createBlock(leavesX, leavesY + dy, leavesZ, 'leaves');
                        }
                    }
                }
            }
        }
    }

    createBlock(x, y, z, type) {
        const blockKey = `${x},${y},${z}`;
        if (this.blocks.has(blockKey)) return;

        let geometry = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        let material;

        if (type === 'glass') {
            material = new THREE.MeshStandardMaterial({
                color: BLOCK_COLORS[type],
                transparent: true,
                opacity: 0.3,
                roughness: 0.1,
                metalness: 0.1
            });
        } else if (type === 'grass') {
            // Grass uchun top, side va bottom ranglar
            const materials = [
                new THREE.MeshStandardMaterial({ color: BLOCK_COLORS[type].sides }), // right
                new THREE.MeshStandardMaterial({ color: BLOCK_COLORS[type].sides }), // left
                new THREE.MeshStandardMaterial({ color: BLOCK_COLORS[type].top }), // top
                new THREE.MeshStandardMaterial({ color: BLOCK_COLORS[type].bottom }), // bottom
                new THREE.MeshStandardMaterial({ color: BLOCK_COLORS[type].sides }), // front
                new THREE.MeshStandardMaterial({ color: BLOCK_COLORS[type].sides }) // back
            ];
            const mesh = new THREE.Mesh(geometry, materials);
            mesh.position.set(x, y, z);
            mesh.userData = { type, x, y, z };
            this.scene.add(mesh);
            this.blocks.set(blockKey, mesh);
            return;
        } else {
            material = new THREE.MeshStandardMaterial({ color: BLOCK_COLORS[type] });
        }

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.userData = { type, x, y, z };
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        this.blocks.set(blockKey, mesh);
    }

    removeBlock(x, y, z) {
        const blockKey = `${x},${y},${z}`;
        const block = this.blocks.get(blockKey);
        if (block) {
            // Blok buzilgandan keyin animatsiya
            this.handGroup.rotation.z = 0;
            
            this.scene.remove(block);
            block.geometry.dispose();
            if (Array.isArray(block.material)) {
                block.material.forEach(mat => {
                    mat.emissive.setHex(0x000000);
                    mat.dispose();
                });
            } else {
                block.material.emissive.setHex(0x000000);
                block.material.dispose();
            }
            this.blocks.delete(blockKey);
            
            // Buzish progress ni tozalash
            this.breakingBlock = null;
            this.breakingProgress = 0;
        }
    }

    setupEventListeners() {
        // Klaviatura
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Escape') {
                this.mouseLocked = false;
                this.canMove = false;
                document.exitPointerLock();
            }
            
            // F5 kamera almashtirish
            if (e.code === 'F5') {
                e.preventDefault();
                // Hozircha first person qoldiramiz
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Inventar tanlash
        for (let i = 1; i <= 9; i++) {
            document.addEventListener('keydown', (e) => {
                if (e.key === i.toString()) {
                    const slot = document.querySelector(`.inventory-slot[data-block]`);
                    if (slot) {
                        document.querySelectorAll('.inventory-slot').forEach(s => s.classList.remove('active'));
                        const targetSlot = document.querySelectorAll('.inventory-slot')[i - 1];
                        if (targetSlot) {
                            targetSlot.classList.add('active');
                            this.selectedBlock = targetSlot.dataset.block;
                            this.updateHeldBlock();
                        }
                    }
                }
            });
        }

        // Mouse click
        this.renderer.domElement.addEventListener('click', () => {
            if (!this.mouseLocked) {
                this.renderer.domElement.requestPointerLock();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.mouseLocked = document.pointerLockElement === this.renderer.domElement;
            this.canMove = true;
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.mouseLocked) return;

            // Yaxshilangan mouse sensitivity
            this.camera.rotation.y -= e.movementX * MOUSE_SENSITIVITY;
            this.camera.rotation.x -= e.movementY * MOUSE_SENSITIVITY;
            this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));
        });

        let isBreaking = false;
        let breakInterval = null;

        this.renderer.domElement.addEventListener('mousedown', (e) => {
            if (!this.mouseLocked) return;

            if (e.button === 0) { // Chap bosish - blok buzish
                isBreaking = true;
                this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
                const intersects = this.raycaster.intersectObjects(Array.from(this.blocks.values()));

                if (intersects.length > 0) {
                    const intersect = intersects[0];
                    const block = intersect.object;
                    const { x, y, z } = block.userData;
                    this.breakingBlock = { x, y, z };
                    this.breakingProgress = 0;
                    this.breakingTime = 0;

                    // Animatsiya: qo'lni tez-tez silkitish
                    breakInterval = setInterval(() => {
                        if (isBreaking && this.breakingBlock) {
                            this.handGroup.rotation.z = Math.sin(Date.now() * 0.03) * 0.1;
                            this.breakingProgress += 0.05;
                            if (this.breakingProgress >= 1) {
                                this.removeBlock(x, y, z);
                                this.breakingBlock = null;
                                this.breakingProgress = 0;
                                isBreaking = false;
                                clearInterval(breakInterval);
                            }
                        }
                    }, 50);
                }
            } else if (e.button === 2) { // O'ng bosish - blok qo'yish
                this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
                const intersects = this.raycaster.intersectObjects(Array.from(this.blocks.values()));

                if (intersects.length > 0) {
                    const intersect = intersects[0];
                    const block = intersect.object;
                    const normal = intersect.face.normal;
                    const newX = block.userData.x + Math.round(normal.x);
                    const newY = block.userData.y + Math.round(normal.y);
                    const newZ = block.userData.z + Math.round(normal.z);
                    
                    // Animatsiya: qo'l bilan urish harakati
                    const originalRot = this.handGroup.rotation.z;
                    this.handGroup.rotation.z = -0.3;
                    setTimeout(() => {
                        this.handGroup.rotation.z = originalRot;
                    }, 150);
                    
                    this.createBlock(newX, newY, newZ, this.selectedBlock);
                }
            }
        });

        this.renderer.domElement.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                isBreaking = false;
                if (breakInterval) {
                    clearInterval(breakInterval);
                    breakInterval = null;
                }
                
                // Blok buzish bekor qilinganda emissive rangni tozalash
                if (this.breakingBlock) {
                    const blockKey = `${this.breakingBlock.x},${this.breakingBlock.y},${this.breakingBlock.z}`;
                    const block = this.blocks.get(blockKey);
                    if (block) {
                        if (Array.isArray(block.material)) {
                            block.material.forEach(mat => {
                                mat.emissive.setHex(0x000000);
                            });
                        } else {
                            block.material.emissive.setHex(0x000000);
                        }
                    }
                }
                
                this.breakingBlock = null;
                this.breakingProgress = 0;
                this.handGroup.rotation.z = 0;
            }
        });

        // O'ng bosish kontekst menuni o'chirish
        document.addEventListener('contextmenu', (e) => e.preventDefault());

        // Oyna o'lchami o'zgarganda
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Inventar slot tanlash
        document.querySelectorAll('.inventory-slot').forEach(slot => {
            slot.addEventListener('click', () => {
                document.querySelectorAll('.inventory-slot').forEach(s => s.classList.remove('active'));
                slot.classList.add('active');
                this.selectedBlock = slot.dataset.block;
                this.updateHeldBlock();
            });
        });
    }

    updateMovement(deltaTime) {
        // WASD harakat har doim mumkin
        const speed = 10;
        const jumpSpeed = 15;
        const gravity = 50;

        this.direction.set(0, 0, 0);
        this.isWalking = false;

        if (this.keys['KeyW']) {
            this.direction.z -= 1;
            this.isWalking = true;
        }
        if (this.keys['KeyS']) {
            this.direction.z += 1;
            this.isWalking = true;
        }
        if (this.keys['KeyA']) {
            this.direction.x -= 1;
            this.isWalking = true;
        }
        if (this.keys['KeyD']) {
            this.direction.x += 1;
            this.isWalking = true;
        }

        // Yo'nalishni kamera ga moslash
        this.direction.normalize();
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
        cameraDirection.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));

        const moveDirection = new THREE.Vector3();
        moveDirection.addScaledVector(cameraDirection, -this.direction.z);
        moveDirection.addScaledVector(right, this.direction.x);
        moveDirection.normalize();

        // X va Z tezligi
        this.velocity.x = moveDirection.x * speed;
        this.velocity.z = moveDirection.z * speed;

        // Y tezligi (sakrash va gravitatsiya)
        const wasOnGround = this.velocity.y === 0;
        if (this.keys['Space'] && wasOnGround) {
            this.velocity.y = jumpSpeed;
            this.isJumping = true;
        }
        
        this.velocity.y -= gravity * deltaTime;

        // Collision detection (oddiy)
        const newPosition = this.camera.position.clone();
        newPosition.x += this.velocity.x * deltaTime;
        newPosition.z += this.velocity.z * deltaTime;
        newPosition.y += this.velocity.y * deltaTime;

        // Yer bilan to'qnashuv
        const groundY = this.getGroundHeight(newPosition.x, newPosition.z);
        if (newPosition.y < groundY + 1.8) {
            newPosition.y = groundY + 1.8;
            this.velocity.y = 0;
            this.isJumping = false;
        }

        this.camera.position.copy(newPosition);

        // Koordinatalarni yangilash
        document.getElementById('pos-x').textContent = Math.floor(this.camera.position.x);
        document.getElementById('pos-y').textContent = Math.floor(this.camera.position.y);
        document.getElementById('pos-z').textContent = Math.floor(this.camera.position.z);
    }

    updateAnimations(deltaTime) {
        this.animationTime += deltaTime;

        if (!this.handGroup) return;

        // Yurish animatsiyasi
        if (this.isWalking && !this.isJumping) {
            // Qo'l va tanani oldinga-orqaga silkitish
            this.handGroup.position.z = -0.5 + Math.sin(this.animationTime * 10) * 0.05;
            this.handGroup.position.y = -0.1 + Math.abs(Math.sin(this.animationTime * 10)) * 0.05;
            this.handGroup.rotation.z = Math.sin(this.animationTime * 10) * 0.1;
        } else if (this.isJumping) {
            // Sakrash animatsiyasi
            this.handGroup.position.y = -0.1 + Math.sin(this.animationTime * 5) * 0.1;
            this.handGroup.rotation.x = 0.3 + Math.sin(this.animationTime * 5) * 0.1;
        } else {
            // Turish animatsiyasi - nafas olish
            this.handGroup.position.y = -0.1 + Math.sin(this.animationTime * 2) * 0.01;
            this.handGroup.position.z = -0.5;
            this.handGroup.rotation.z = 0;
            this.handGroup.rotation.x = 0.3;
        }

        // Blok buzish animatsiyasi
        if (this.breakingBlock && this.breakingProgress > 0) {
            // Blok buzilayotganda rangni o'zgartirish (oddiy versiya)
            const blockKey = `${this.breakingBlock.x},${this.breakingBlock.y},${this.breakingBlock.z}`;
            const block = this.blocks.get(blockKey);
            if (block) {
                const alpha = 1 - this.breakingProgress;
                if (Array.isArray(block.material)) {
                    block.material.forEach(mat => {
                        mat.emissive.setHex(0xff0000).multiplyScalar(this.breakingProgress);
                    });
                } else {
                    block.material.emissive.setHex(0xff0000).multiplyScalar(this.breakingProgress);
                }
            }
        }
    }

    getGroundHeight(x, z) {
        const blockX = Math.floor(x);
        const blockZ = Math.floor(z);
        
        for (let y = 100; y >= -10; y--) {
            const blockKey = `${blockX},${y},${blockZ}`;
            if (this.blocks.has(blockKey)) {
                return y + 1;
            }
        }
        return 0;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = 0.016; // ~60 FPS
        this.updateMovement(deltaTime);
        this.updateAnimations(deltaTime);
        
        // Moblar animatsiyasi
        this.mobs.forEach(mob => {
            mob.update(deltaTime, this);
        });
        
        this.renderer.render(this.scene, this.camera);
    }
}

// O'yinni boshlash
new Game();
