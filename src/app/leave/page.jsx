'use client'

import React from 'react'
import LeaveForm from './form/leaveRequestForm'
import LeaveRequestTable from './table/leaveRequestTable'

export default function LeavePage() {
    return (
        <main className="max-w-6xl mx-auto p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Leave Request</h1>

            {/* Form Section */}
            <section className="mb-12">
                <LeaveForm />
            </section>

            {/* Table Section */}
            <section>
                <LeaveRequestTable />
            </section>
        </main>
    )
}
