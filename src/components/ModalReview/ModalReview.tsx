import React from 'react'

const ModalReview = () => {
    
    const handleCloseModal = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Escape") {
            // closeModal()
        }
    }
    return (
        <div className='backdrop'>
             <div className="modal" onKeyDown={handleCloseModal} tabIndex={0}>
        
             </div>
        </div>
    )
}

export default ModalReview
