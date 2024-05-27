export function ReceiverCode({ code }) {
  return (
    <div className="flex items-center justify-center bg-transparent">
      <div className="bg-transparent px-8 py-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-center space-x-3">
          {code.split('').map((digit, index) => (
            <div
              key={index}
              className="w-12 h-12 bg-black rounded-md flex items-center justify-center text-white font-bold text-2xl"
            >
              {digit}
            </div>
          ))}
          
        </div>
      </div>
    </div>
  )
}