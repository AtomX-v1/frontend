'use client';

import { useState } from 'react';
import SwapCube from '@/components/SwapCube';
import { SwapCube as SwapCubeType } from '@/types';
import { generateId } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableItem({ cube, index, onUpdate, onRemove }: {
  cube: SwapCubeType;
  index: number;
  onUpdate: (cube: SwapCubeType) => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cube.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {index > 0 && (
        <div className="h-4 flex items-center justify-center">
          <div className="font-mono text-xs text-gray-600">↓</div>
        </div>
      )}
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing font-mono text-gray-600 hover:text-[#00cc00]">
          ⣿
        </div>
        <div className="flex-1">
          <SwapCube
            cube={cube}
            onUpdate={onUpdate}
            onRemove={onRemove}
            isDragging={isDragging}
          />
        </div>
      </div>
    </div>
  );
}

export default function ComboBuilder() {
  const connected = false;
  const [cubes, setCubes] = useState<SwapCubeType[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addCube = () => {
    const newCube: SwapCubeType = {
      id: generateId(),
      type: 'swap',
    };
    setCubes([...cubes, newCube]);
  };

  const updateCube = (id: string, updatedCube: SwapCubeType) => {
    setCubes(cubes.map((cube) => (cube.id === id ? updatedCube : cube)));
  };

  const removeCube = (id: string) => {
    setCubes(cubes.filter((cube) => cube.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCubes((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const executeCombo = async () => {
    if (!connected) {
      alert('WALLET NOT CONNECTED');
      return;
    }

    setIsExecuting(true);
    try {
      console.log('Executing combo:', cubes);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert('TRANSACTION EXECUTED');
    } catch (error) {
      console.error('Execution failed:', error);
      alert('EXECUTION FAILED');
    } finally {
      setIsExecuting(false);
    }
  };

  const isValidCombo = cubes.length > 0 && cubes.every(
    (cube) => cube.dex && cube.tokenIn && cube.tokenOut && cube.amountIn
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="cyber-card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#ffff00] mb-1 font-mono">[01] COMBO BUILDER</h1>
              <p className="text-gray-600 font-mono text-xs">CHAIN_SWAP_PROTOCOL // MULTI_DEX_EXECUTION</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCubes([])}
                disabled={cubes.length === 0}
                className="border border-[#ff0000] px-4 py-2 text-[#ff0000] hover:bg-[#ff0000] hover:text-black disabled:opacity-30 transition-colors font-mono text-xs"
              >
                [CLEAR]
              </button>
              <button
                onClick={addCube}
                className="border border-[#00cc00] px-4 py-2 text-[#00cc00] hover:bg-[#00cc00] hover:text-black transition-colors font-mono text-xs"
              >
                [+ADD]
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Swap chain */}
          <div className="lg:col-span-2">
            <div className="cyber-card p-6 min-h-[600px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-mono text-[#00cc00]">SWAP_SEQUENCE [{cubes.length}]</h2>
                <div className="text-xs font-mono text-gray-600">
                  DRAG_TO_REORDER
                </div>
              </div>

              {cubes.length === 0 ? (
                <div className="flex items-center justify-center h-96 border-2 border-dashed border-gray-800">
                  <div className="text-center">
                    <p className="text-gray-600 font-mono text-lg mb-2">NO_SWAPS_CONFIGURED</p>
                    <p className="text-gray-700 font-mono text-sm">CLICK_ADD_SWAP_TO_BEGIN</p>
                  </div>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={cubes.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {cubes.map((cube, index) => (
                        <SortableItem
                          key={cube.id}
                          cube={cube}
                          index={index}
                          onUpdate={(updated) => updateCube(cube.id, updated)}
                          onRemove={() => removeCube(cube.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>

          {/* Execution panel */}
          <div className="space-y-6">
            <div className="cyber-card p-6">
              <h3 className="text-sm font-mono text-[#ff9900] mb-4">EXECUTION_STATUS</h3>
              <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">SWAPS_QUEUED</span>
                  <span className="text-[#00cc00]">{cubes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">VALID_CONFIG</span>
                  <span className={isValidCombo ? 'text-[#00cc00]' : 'text-[#ff0000]'}>
                    {isValidCombo ? '[YES]' : '[NO]'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">EST_GAS</span>
                  <span className="text-gray-500">~0.005 SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">WALLET</span>
                  <span className={connected ? 'text-[#00cc00]' : 'text-[#ff0000]'}>
                    {connected ? '[CONNECTED]' : '[DISCONNECTED]'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={executeCombo}
              disabled={!isValidCombo || isExecuting || !connected}
              className="w-full border border-[#ffff00] p-4 text-[#ffff00] hover:bg-[#ffff00] hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-mono text-sm"
            >
              {isExecuting ? '[EXECUTING...]' : '[EXECUTE_COMBO]'}
            </button>

            <div className="cyber-card p-6">
              <h3 className="text-xs font-mono text-[#00cc00] mb-3">PROTOCOL_INFO</h3>
              <div className="space-y-2 font-mono text-xs text-gray-600">
                <p>▸ SUPPORTS: ORCA / RAYDIUM / METEORA / JUPITER</p>
                <p>▸ MAX_HOPS: UNLIMITED</p>
                <p>▸ SLIPPAGE: AUTO_CALCULATED</p>
                <p>▸ EXECUTION: SINGLE_TRANSACTION</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
