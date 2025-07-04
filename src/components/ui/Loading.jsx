import { motion } from 'framer-motion';

const Loading = ({ type = 'default' }) => {
  const shimmerVariants = {
    animate: {
      x: ['-100%', '100%'],
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: 'linear'
      }
    }
  };

  if (type === 'dashboard') {
    return (
      <div className="p-6 space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-48 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                variants={shimmerVariants}
                animate="animate"
              />
            </div>
            <div className="h-4 bg-gray-200 rounded w-32 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                variants={shimmerVariants}
                animate="animate"
              />
            </div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
              variants={shimmerVariants}
              animate="animate"
            />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-24 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                    variants={shimmerVariants}
                    animate="animate"
                  />
                </div>
                <div className="h-8 bg-gray-200 rounded w-16 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                    variants={shimmerVariants}
                    animate="animate"
                  />
                </div>
                <div className="h-4 bg-gray-200 rounded w-20 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                    variants={shimmerVariants}
                    animate="animate"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-32 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                    variants={shimmerVariants}
                    animate="animate"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-lg relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                    variants={shimmerVariants}
                    animate="animate"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-28 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                    variants={shimmerVariants}
                    animate="animate"
                  />
                </div>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full relative overflow-hidden">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                        variants={shimmerVariants}
                        animate="animate"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24 relative overflow-hidden">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                          variants={shimmerVariants}
                          animate="animate"
                        />
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-16 relative overflow-hidden">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                          variants={shimmerVariants}
                          animate="animate"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gray-200 rounded-full relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                  variants={shimmerVariants}
                  animate="animate"
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-32 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                    variants={shimmerVariants}
                    animate="animate"
                  />
                </div>
                <div className="h-4 bg-gray-200 rounded w-48 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                    variants={shimmerVariants}
                    animate="animate"
                  />
                </div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                  variants={shimmerVariants}
                  animate="animate"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                variants={shimmerVariants}
                animate="animate"
              />
            </div>
            <div className="h-12 bg-gray-200 rounded-lg relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                variants={shimmerVariants}
                animate="animate"
              />
            </div>
          </div>
        ))}
        <div className="h-10 w-32 bg-gray-200 rounded-lg relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
            variants={shimmerVariants}
            animate="animate"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;