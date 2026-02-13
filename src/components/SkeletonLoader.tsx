import React from 'react';

export function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl p-3 shadow-sm flex flex-col items-center animate-pulse">
            <div className="w-full h-4 bg-gray-200 rounded mb-2" />
            <div className="w-2/3 h-3 bg-gray-100 rounded mb-3" />
            <div className="w-full aspect-square bg-gray-100 rounded-xl mb-3" />
            <div className="w-full flex justify-between">
                <div className="w-16 h-4 bg-gray-200 rounded" />
                <div className="w-8 h-8 bg-gray-200 rounded-lg" />
            </div>
        </div>
    );
}

export function ProductDetailSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="w-full h-96 bg-gray-200 rounded-[2.5rem] mb-6" />
            <div className="px-6 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="h-20 bg-gray-100 rounded" />
                <div className="h-32 bg-gray-100 rounded-2xl" />
            </div>
        </div>
    );
}

export function OrderSkeleton() {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm mb-4 animate-pulse">
            <div className="flex justify-between mb-2">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
            <div className="h-3 bg-gray-100 rounded w-20 mb-2" />
            <div className="flex justify-between">
                <div className="h-3 bg-gray-100 rounded w-12" />
                <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
        </div>
    );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
    return (
        <tr className="animate-pulse">
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                </td>
            ))}
        </tr>
    );
}
